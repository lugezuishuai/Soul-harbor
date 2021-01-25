import React from 'react';
import { ConfigProvider } from 'antd';
import { Route } from 'react-router-dom';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Employee from '@/components/employee';
import Settings from '@/components/setting';
import Content from '@/components/home/Content';
import UserInfo from '@/components/userInfo';
import Header from './Header';
import Footer from './Footer';
import './index.less';

export default function Home() {
  return (
    <ConfigProvider locale={zh_CN}>
      <div className="home_global">
        <Header/>
        <div className="home_global_divide"></div>
        <div className="home_global_content">
          <Route path="/" exact component={Content}/>
          <Route path="/chat" component={Employee}/>
          <Route path="/news" component={Settings}/>
          <Route path="/blog" component={Employee}/>
          <Route path="/user" component={UserInfo}/>
        </div>
        <Footer/>
      </div>
    </ConfigProvider>
  )
}