import './style/index.scss';
import FullStory from 'react-fullstory';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const Root = () => (
  <>
    {process.env.ENVIRONMENT === 'production' && (
      <FullStory org="BVJQA" />
    )}
    <App />
  </>
);

ReactDOM.render(
  <Root />,
  document.getElementById('kronologic-ai-app'),
);
