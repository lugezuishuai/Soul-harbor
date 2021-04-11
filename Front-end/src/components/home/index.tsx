import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Employee from '@/components/employee';
import UploadFile from '@/components/setting';
import Content from '@/components/home/Content';
import UserInfo from '@/components/userInfo';
import Header from './Header';
import Footer from './Footer';
import ResetPw from '@/pages/updatePassword';
import NotFound from '@/pages/not-found';
import NoPermission from '@/pages/no-permission';
import Error from '@/pages/error-page';
import { WrapWithLogin } from '@/components/with-login';
// @ts-ignore
import ScrollToTop from './scrollToTop.js';
import './index.less';

function WrapUserInfo() {
  return (
    <WrapWithLogin noLoginPlaceholder={<NoPermission className="wrap-exception" />}>
      <UserInfo />
    </WrapWithLogin>
  );
}

export default function Home() {
  return (
    <ConfigProvider locale={zh_CN} prefixCls="ant">
      <div className="home-global">
        <Router>
          <Switch>
            <Route path="/exception/403" exact component={NoPermission} />
            <Route path="/exception/404" exact component={NotFound} />
            <Route path="/exception/500" exact component={Error} />
            <Route path="/reset/:token" exact component={ResetPw} />
            <Route path="/">
              <div className="home-global__header">
                <Header />
                <div className="home-global__divide" />
              </div>
              <div className="home-global__container">
                <div className="home-global__content">
                  <ScrollToTop>
                    <Switch>
                      <Route path="/home" exact component={Content} />
                      <Route path="/chat" exact component={Employee} />
                      <Route path="/news" exact component={UploadFile} />
                      <Route path="/blog" exact component={Employee} />
                      <Route path="/user/:id" exact component={WrapUserInfo} />
                      <Redirect to="/home" />
                    </Switch>
                  </ScrollToTop>
                </div>
                <Footer />
              </div>
            </Route>
          </Switch>
        </Router>
      </div>
    </ConfigProvider>
  );
}
