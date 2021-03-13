import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Employee from '@/components/employee';
import Settings from '@/components/setting';
import Content from '@/components/home/Content';
import UserInfo from '@/components/userInfo';
import Header from './Header';
import Footer from './Footer';
// @ts-ignore
import ScrollToTop from './scrollToTop.js';
import './index.less';

export default function Home() {
  return (
    <ConfigProvider locale={zh_CN}>
      <div className="home-global">
        <Router>
          <div className="home-global__header">
            <Header/>
            <div className="home-global__divide" />
          </div>
          <div className="home-global__container">
            <div className="home-global__content">
              <ScrollToTop>
                <Route path="/" exact component={Content}/>
                <Route path="/chat" component={Employee}/>
                <Route path="/news" component={Settings}/>
                <Route path="/blog" component={Employee}/>
                <Route path="/user/:id" exact component={UserInfo}/>
              </ScrollToTop>
            </div>
            <Footer/>
          </div>
        </Router>
      </div>
    </ConfigProvider>
  )
}