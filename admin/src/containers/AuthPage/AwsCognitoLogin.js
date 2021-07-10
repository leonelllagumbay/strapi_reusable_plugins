import React from 'react';
import axios from 'axios';
import useChangeLanguage from '../LanguageProvider/hooks/useChangeLanguage';
import { auth } from 'strapi-helper-plugin';
import { useHistory } from 'react-router-dom';

let idToken = "";
const cognitoReturnedToken = location.hash;
if (cognitoReturnedToken) {
  const hashParts = cognitoReturnedToken.split("&");

  hashParts.forEach((part) => {
    const indexOfTokenStr = part.indexOf("id_token");
    if (indexOfTokenStr > -1) {
      idToken = part.substring(indexOfTokenStr + 9, part.length);
    }
  });
}

const AwsCognitoLogin = () => {
  const changeLocale = useChangeLanguage();
  const { push } = useHistory();

  const acquireToken = async () => {
    await verifyToken({
      ssoToken: idToken
    }, '/verifyToken');
  }

  const verifyToken = async (body, requestURL) => {
    try {
      const {
        data: {
          data: { token, user },
        },
      } = await axios({
        method: 'POST',
        url: `${strapi.backendURL}${requestURL}`,
        data: body,
      });

      if (user.preferedLanguage) {
        changeLocale(user.preferedLanguage);
      }

      auth.setToken(token, false);
      auth.setUserInfo(user, false);

      idToken = "";
      push('/');
    } catch (err) {
      console.log('aws cognito login error', err);
      strapi.notification.error('Unable to login to AWS Cognito Login');
    }
  };

  if (!idToken) {
    location.href = "https://leonelllagumbay.auth.us-east-1.amazoncognito.com/login?client_id=61ishi28kmir29u75p0qpih5pv&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:8000/admin/auth/login";
  } else {
    acquireToken();
  }

  return (
    <div></div>
  )
}

export default AwsCognitoLogin;
