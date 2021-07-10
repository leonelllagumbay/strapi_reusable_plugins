import React, {useState} from 'react';
import {
  SettingsPageTitle,
  SizedInput,
  useGlobalContext,
  request,
  getYupInnerErrors,
} from 'strapi-helper-plugin';
import { Header, List } from '@buffetjs/custom';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <SettingsPageTitle name="AWS Cognito Settings" />
      <div>
        <Header title={{ label: "AWS Cognito Settings" }} isLoading={isLoading} />
        Testing
      </div>
    </>
  )
}

export default Settings;
