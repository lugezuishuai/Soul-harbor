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
// @ts-ignore
import ScrollToTop from './scrollToTop.js';
import './index.less';

export default function Home() {
  return (
    <ConfigProvider locale={zh_CN}>
      <div className="home-global">
        <Router>
          <Switch>
            <Route path="/reset/:token" exact component={ResetPw} />
            <Route path="/">
              <div className="home-global__header">
                <Header/>
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
                      <Route path="/user/:id" exact component={UserInfo} />
                      <Redirect to="/home" />
                    </Switch>
                  </ScrollToTop>
                </div>
                <Footer/>
              </div>
            </Route>
          </Switch>
        </Router>
      </div>
    </ConfigProvider>
  )
}