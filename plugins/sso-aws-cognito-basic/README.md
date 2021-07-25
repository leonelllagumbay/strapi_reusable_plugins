# Strapi plugin sso-aws-cognito-basic

This is a basic plugin to experience single sign on using Amazon Cognito.
This supports authentication with role mapping. This will map your Strapi roles directly with Amazon
Cognito.
If the role match then the user will be created (if does not exist and updated if existing) and authenticated.
This way you can extend it to authorize AWS services at the same time authorize your own Strapi services.

To authenticate, use the returned token as parameter. After authenticated, it will still use the Strapi jwt token since you are just accessing its internal APIs.

This will work both for admin and API users.
For API users, in the client pass the ssoToken (token returned after logging in to Cognito) to /verifyTokenAPIUser endpoint.

# Supported Strapi versions:

Strapi v3.6.x and above

# Installation

npm install strapi-plugin-sso-aws-cognito-basic
or
yarn add strapi-plugin-sso-aws-cognito-basic

# Copy required files

Inside plugin strapi-files copy admin to admin/ project root directory and copy hooks.js to Strapi config. Also copy the hooks folder to the Strapi root directory. If the admin folder already exist, only copy the files and admin.config.js files that are necessary (only few lines of code)

# Setup up environment variables like so

Create .env if not yet available on the project root directory

Add the following variables corresponding to your setup
COGNITO_DOMAIN=https://{username}.auth.{region}.amazoncognito.com
COGNITO_CLIENT_ID=45ishi11kmir29u23p0qpih5as
COGNITO_REDIRECT_URI=http://localhost:8000/admin/auth/login
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_DdcKJ1Eeb
COGNITO_IDENTITY_POOL_ID=us-east-1:122db3b7-3232-45c2-8c93-abbcad58de1f
COGNITO_ROLE_MAPPING=[{"awsRole":"arn:aws:iam::994583806537:role/Admin","strapiRole":"Super Admin"},
COGNITO_ROLE_MAPPING_API_USERS=[] # If using API users
COGNITO_JWKS={"keys":[{"alg":"RS256","e":"AQAB","kid":"Z2MsSpAMRQTIFjNSk1srITFdyfgZWM0ixym7PpyGZMs=","kty":"RSA","n":"wpKO6kRICmnE...","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"T1wa7JZwouSg/hrnWMnmSnS6CT6E7TAy/bk2Arfwm3Q=","kty":"RSA","n":"tYuW15E...","use":"sig"}]}

## For COGNITO_ROLE_MAPPING, the original data is:

[{
   awsRole: 'arn:aws:iam::994583806537:role/Admin',
   strapiRole: 'Super Admin'
 }, {
   awsRole: 'arn:aws:iam::994583806537:role/Technologist',
   strapiRole: 'Technologist'
}]

## then converted to string like so

[{"awsRole":"arn:aws:iam::994583806537:role/Admin","strapiRole":"Super Admin"},{"awsRole":"arn:aws:iam::994583806537:role/Technologist","strapiRole":"Technologist"}]



It is required that you map your Strapi roles to the corresponding role from AWS Cognito.

# Enable the plugin in the Strapi config file

# Copy hooks file and folder

This will make sure that the verifytoken api is public

# Run the project

# npm
npm run build && npm run develop

# yarn
yarn build && yarn develop
