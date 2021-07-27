import React from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import axios from 'axios';
import useChangeLanguage from '../LanguageProvider/hooks/useChangeLanguage';
import { auth } from 'strapi-helper-plugin';
import { useHistory } from 'react-router-dom';

let azureCode = ""; // Azure code
const azureReturnCode = location.hash.replace('#', '?');
if (azureReturnCode) {
  const searchParams = new URLSearchParams(azureReturnCode);
  azureCode = searchParams.get("code");
}

const AzureLogin = () => {
  const changeLocale = useChangeLanguage();
  const { push } = useHistory();

  const { instance, accounts } = useMsal();

  const acquireToken = async () => {
    if (accounts && accounts[0]) {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });
      await verifyTokenAzure({
        azureToken: response.accessToken
      }, '/verifyTokenAzureActiveDirectory');
    } else {
      console.log('accounts[0] not yet defined');
    }
  }

  const verifyTokenAzure = async (body, requestURL) => {
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

      azureCode = "";
      push('/');
    } catch (err) {
      console.log('azure login error', err);
      strapi.notification.error('Unable to login to Azure Active Directory');
    }
  };

  if (!azureCode) {
    instance.loginRedirect(loginRequest).catch(e => {
      strapi.notification.error('Azure redirect error');
    });
  } else { // Azure login
    acquireToken();
  }

  return (
    <div></div>
  )
}

export default AzureLogin;
