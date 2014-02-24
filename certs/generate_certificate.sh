#!/bin/bash

DOMAIN=localhost
COMPANY=pm2-web
COUNTRY=UK
CA_KEY=`LC_CTYPE=C tr -dc A-Za-z0-9_\!\@\#\$\%\^\&\*\(\)-+= < /dev/urandom | head -c 32 | xargs`
CRT_KEY=`LC_CTYPE=C tr -dc A-Za-z0-9_\!\@\#\$\%\^\&\*\(\)-+= < /dev/urandom | head -c 32 | xargs`

# Create the CA Key and Certificate for signing Client Certs
echo Creating CA key
openssl genrsa -des3 -out ca.key -passout pass:$CA_KEY 4096

echo Creating CA certificate for "/CN=$DOMAIN/O=$COMPANY/C=$COUNTRY"
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/CN=$DOMAIN/O=$COMPANY/C=$COUNTRY" -passin pass:$CA_KEY

# Create the Server Key, CSR, and Certificate
echo Creating server key
openssl genrsa -des3 -out server.key -passout pass:$CRT_KEY 1024

echo Creating server certificate for "/CN=$DOMAIN/O=$COMPANY/C=$COUNTRY"
openssl req -new -key server.key -out server.csr -subj "/CN=$DOMAIN/O=$COMPANY/C=$COUNTRY" -passin pass:$CRT_KEY

# We're self signing our own server cert here.  This is a no-no in production.
echo Signing server certificate
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt -passin pass:$CA_KEY

echo
echo All done. Add the following to the \"www\" section of your config.json:
echo
echo '{'
echo -e '\t"www": {'
echo -e '\t\t...'
echo -e '\t\t"ssl": {'
echo -e '\t\t\t"enabled": true,'
echo -e '\t\t\t"passphrase": "'$CRT_KEY'",'
echo -e '\t\t\t"key": "'`pwd`'/server.key",'
echo -e '\t\t\t"certificate": "'`pwd`'/server.crt"'
echo -e '\t\t}'
echo -e '\t}'
echo -e '\t...'
echo '}'
