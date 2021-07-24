import React, { useState } from 'react';
import Wrapper from './Wrapper';
import {
  SettingsPageTitle,
} from 'strapi-helper-plugin';
import { InputText, Text, Label } from '@buffetjs/core';
import { Header, List } from '@buffetjs/custom';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    region: '',
    userPoolId: '',
    identityPoolId: '',
    domain: 'https://leonelllagumbay.auth.us-east-1.amazoncognito.com',
    clientId: '',
    redirectUri: 'http://localhost:8000/admin/auth/login',
    roleMapping: [],
    jwks: {}
  });
  return (
    <Wrapper>
      <SettingsPageTitle name="AWS Cognito Settings" />
      <div>
        <Header title={{ label: "AWS Cognito Settings" }} isLoading={isLoading}
          content="AWS Cognito Configuration (Use .env variables instead)"
        />
      </div>
      <Text>

      </Text>
      <Label className="mt-20" htmlFor="region">Region</Label>
      <InputText
        name="region"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, region: value });
        }}
        placeholder="Region"
        type="text"
        value={formData.region}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="userPoolId">User Pool ID</Label>
      <InputText
        name="userPoolId"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, userPoolId: value });
        }}
        placeholder="User Pool ID"
        type="text"
        value={formData.userPoolId}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="identityPoolId">Identity Pool ID</Label>
      <InputText
        name="identityPoolId"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, identityPoolId: value });
        }}
        placeholder="User Pool ID"
        type="text"
        value={formData.identityPoolId}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="domain">Domain</Label>
      <InputText
        name="domain"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, domain: value });
        }}
        placeholder="Domain"
        type="text"
        value={formData.domain}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="clientId">Client ID</Label>
      <InputText
        name="clientId"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, clientId: value });
        }}
        placeholder="Client ID"
        type="text"
        value={formData.clientId}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="redirectUri">Redirect URI</Label>
      <InputText
        name="redirectUri"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, redirectUri: value });
        }}
        placeholder="Redirect URI"
        type="text"
        value={formData.redirectUri}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="roleMapping">Role Mapping</Label>
      <InputText
        name="roleMapping"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, roleMapping: value });
        }}
        placeholder="Role Mapping"
        type="text"
        value={formData.roleMapping}
        disabled={true}
      />

      <Label className="mt-20" htmlFor="jwks">Jwks</Label>
      <InputText
        name="jwks"
        onChange={({ target: { value } }) => {
          setFormData({ ...formData, jwks: value });
        }}
        placeholder="Jwks"
        type="text"
        value={formData.jwks}
        disabled={true}
      />
    </Wrapper>
  )
}

export default Settings;
