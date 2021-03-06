import React from "react";
import Helmet from "react-helmet";
import "font-awesome/scss/font-awesome.scss";
import Navigation from "../components/Navigation/Navigation";
import GetNavList from "../components/Navigation/NavList";
import {Row, Col, Button, notification, message, Popconfirm, Modal} from 'antd';
const confirm = Modal.confirm;
import config from "../../data/SiteConfig";
import FontIcon from "react-md/lib/FontIcons";
import Link from "gatsby-link";
import "./index.scss";
import "./global.scss";
import {
  Avatar,
  List,
  ListItem,
  ListItemControl,
  Checkbox,
  Switch,
} from 'react-md';
import copy from 'copy-to-clipboard';

export default class MainLayout extends React.Component {

  copyToClipboardOption(e){
  const URL_loc = e.target.href;
  console.log(e.target);
  confirm({
    title: "Do you want to copy or visit?",
    description: e.target.id,
    cancelText: "Visit URL",
    okText: "Copy URL",
    onOk(){
    if(copy(URL_loc)){
      notification.success({
        message: "Copied To Clipboard",
        description: URL_loc
      });
    }
    },
    onCancel(){
    window.open(URL_loc);
    }
  });
  e.preventDefault();


  return false;
  }


  makeNavItems(){
    const navList = [
      {
        primaryText: "Home",
        leftIcon: <FontIcon>home</FontIcon>,
        component: Link,
        to: "/"
      },
      {
        divider: true
      }
    ];

    const categories = {}


    const navCategories = {
    }
    this.props.data.allAirtableCategories.edges.forEach(edge => {
      navCategories[edge.node.id] = [
      ];
      categories[edge.node.id] = edge.node;

    });
    this.props.data.allAirtableItems.edges.forEach(edge => {
      edge.node.Category.map(cat => {
        navCategories[cat].push(
        <ListItem href={edge.node.URL} id={ edge.node.Name } component='a' onClick={this.copyToClipboardOption}
        primaryText={edge.node.Name} key={edge.node.id}
        />)
      });
    });

    Object.keys(navCategories).map(function(key, index) {
    if(navCategories[key].length > 0){
        navList.push(
          <ListItem nestedItems={navCategories[key]} primaryText={categories[key].Name} key={key}/>)
        navList.push({
          divider: true
        });
        }
    });
    navList.push(<a href="https://app.netlify.com/start/deploy?repository=https://github.com/daredoes/redirection">
    <ListItem primaryText="Deploy to Netlify" leftIcon={<FontIcon forceSize iconClassName='fa fa-rocket' />}></ListItem>
    </a>);

    GetNavList(config).forEach((item) => {
      navList.push(item);
    });

    return navList;



  }

  getLocalTitle() {
    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const pathPrefix = config.pathPrefix ? config.pathPrefix : "/";
    const currentPath = this.props.location.pathname
      .replace(pathPrefix, "")
      .replace("/", "");
    let title = "";
    if (currentPath === "") {
      title = "Home";
    } else if (currentPath === "tags") {
      title = "Tags";
    } else if (currentPath === "categories") {
      title = "Categories";
    } else if (currentPath === "about") {
      title = "About";
    } else if (currentPath.includes("posts")) {
      title = "Article";
    } else if (currentPath.includes("tags")) {
      const tag = currentPath
        .replace("tags", "")
        .replace("/", "")
        .replace("-", " ");
      title = `Tagged in ${capitalize(tag)}`;
    } else if (currentPath.includes("categories")) {
      const category = currentPath
        .replace("categories", "")
        .replace("/", "")
        .replace("-", " ");
      title = `${capitalize(category)}`;
    }
    return title;
  }
  render() {
    const { children } = this.props;
    return (
      <Navigation config={config} navItems={this.makeNavItems()} LocalTitle={this.getLocalTitle()}>
        <div>
          <Helmet>
            <meta name="description" content={config.siteDescription} />
          </Helmet>
          {children()}
        </div>
      </Navigation>
    );
  }
}
/* eslint no-undef: "off"*/
export const pageQuery = graphql`
  query IndexLayoutQuery {
  allAirtableCategories(
    sort: { fields: [Name], order: ASC }
  ) {
    edges {
      node {
        id,
        Name,
        Description
      }
    }
  },
  allAirtableItems(
  sort: { fields: [Name], order: ASC }
  ){
    edges{
      node{
        id,
        Name,
        Public,
        Enabled,
        URL,
        Path,
        Description,
        Category
      }
    }
  }
}
`;
