/**
 *
 * Logout
 *
 */

/* eslint-disable */
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { get } from 'lodash';
import { auth } from 'strapi-helper-plugin';
import Wrapper from './components';
import { useMsal } from "@azure/msal-react"; // Custom Azure logout

const Logout = ({ history: { push } }) => {
  const { instance } = useMsal(); // Custom Azure logout
  const [isOpen, setIsOpen] = useState(false);

  const handleGoToMe = () => {
    push({
      pathname: `/me`,
    });
  };

  const handleLogout = () => {
    auth.clearAppStorage();

    // Custom AWS Cognitor
    // location.href = `${FE_CUSTOM_VARIABLES.COGNITO_DOMAIN}/logout?client_id=${FE_CUSTOM_VARIABLES.COGNITO_CLIENT_ID}&logout_uri=${FE_CUSTOM_VARIABLES.COGNITO_REDIRECT_URI}&redirect_uri=${FE_CUSTOM_VARIABLES.COGNITO_REDIRECT_URI}&response_type=token`;
    // Custom Azure logout
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
    // push('/auth/login');
  };

  const toggle = () => setIsOpen(prev => !prev);

  const userInfo = auth.getUserInfo();
  const displayName =
    userInfo && userInfo.firstname && userInfo.lastname
      ? `${userInfo.firstname} ${userInfo.lastname}`
      : get(userInfo, 'username', '');

  return (
    <Wrapper>
      <ButtonDropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle>
          {displayName}
          <FontAwesomeIcon icon="caret-down" />
        </DropdownToggle>
        <DropdownMenu className="dropDownContent">
          <DropdownItem onClick={handleGoToMe} className="item">
            <FormattedMessage id="app.components.Logout.profile" />
          </DropdownItem>
          <DropdownItem onClick={handleLogout}>
            <FormattedMessage id="app.components.Logout.logout" />
            <FontAwesomeIcon icon="sign-out-alt" />
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    </Wrapper>
  );
};

export default withRouter(Logout);
