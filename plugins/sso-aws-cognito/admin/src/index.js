import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import App from './containers/App';
import Initializer from './containers/Initializer';
import lifecycles from './lifecycles';
import trads from './translations';

import Settings from '../components/Settings';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
  const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.strapi.name;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name,
    preventComponentRendering: false,
    settings: {
      global: {
        links: [
          {
            title: 'AWS Cognito Settings',
            to: `${strapi.settingsBaseURL}/${pluginId}/settings`,
            name: 'AWSCognitoSetting',
            Component: Settings,
            exact: false,
            permissions: [{ action: 'plugins::sso-aws-cognito.cognito', subject: null }],
          },
        ],
      },
    },
    trads,
    menu: null,
  };

  return strapi.registerPlugin(plugin);
};
