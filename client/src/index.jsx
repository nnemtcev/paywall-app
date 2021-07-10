// ---------- Packages ---------- //
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import $ from 'jquery';
import axios from 'axios';

// ---------- Material UI ---------- //
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// ---------- Componenets ---------- //
import LoggedOutHome from './components/LoggedOutHome.jsx';
import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Profile from './components/Profile.jsx';
import Navbar from './components/Navbar.jsx';
// ---------- Helper ---------- //
import feedManipulation from './feedManipulation.js'

// ---------- Web Socket ---------- //
import io from 'socket.io-client';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#3D95CE',
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      isLoggedIn: false,
      globalFeed: {},
      userFeed: {},
      balance: null,
      userInfo: {},
      friends: [],
      socket: io(),
      loggedInUserId: null,
      messages: [],
      notifications: []
    }
  }

  componentDidMount() {
  }

  loadUserData(userId) {
    this.getUserInfo(userId)
    this.getBalance(userId);
    this.getFeed('globalFeed', userId);
    this.getFeed('userFeed', userId);
    this.getFriendsList(userId);
  }

  refreshUserData(userId) {
    this.getBalance(userId);
    this.getFeed('globalFeed', userId, this.state.globalFeed.newestTransactionId || null);
    this.getFeed('userFeed', userId, this.state.userFeed.newestTransactionId || null);
    this.getFriendsList(userId);
  }

  getFeed(feedType, userId = null, sinceId) {
    let endpoint = feedManipulation.returnFeedEndpoint(feedType, userId);

    let params = {
      sinceId: sinceId,
      userId: userId
    }

    axios(endpoint, {params: params})
      .then((response) => {
        this.prependNewTransactions(feedType, response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  prependNewTransactions(feedType, transactionSummary) {
    // If no results return, do nothing
    if (!transactionSummary || transactionSummary.count === 0) {
      return;
    }

    // If feed was empty, set the returned transactions as the feed
    let isFeedEmpty = !this.state[feedType].count || this.state[feedType].count === 0;

    let newFeedObject = isFeedEmpty
      ? transactionSummary
      : feedManipulation.mergeFeeds(transactionSummary, this.state[feedType]);

    this.setState({
      [feedType]: newFeedObject
    })
  }

  loadMoreFeed(feedType, userId) {
    let endpoint = feedManipulation.returnFeedEndpoint(feedType, userId);

    // Send along the next valid ID you'd like returned back
    // from the database
    let params = {
      beforeId: this.state[feedType].nextPageTransactionId
    }

    axios(endpoint, {params: params})
      .then((response) => {

        // Confirm there additional items to load
        if (response.data && response.data.count > 0) {
          let combinedItems = feedManipulation.mergeFeeds(this.state[feedType], response.data);

          this.setState({
            [feedType]: combinedItems
          })
        }
      })
      .catch((err) => {
        console.error(err);
      }); 
  }

  getBalance(userId) {
    axios('/balance', {params: {userId: userId}})
      .then((response) => {
        this.setState({
          balance: response.data.amount
        });
      })
      .catch((err) =>{
        console.error(err);
      });
  }

  getUserInfo(userId) {
    axios('/profile', {params: {userId: userId}})
      .then((response) => {
        this.setState({
          userInfo: response.data
        });
      })
      .catch((err) =>{
        console.error(err);
      });
  }

  getFriendsList(userId) {
    axios('/friends', {params: {userId: userId}})
      .then((response) => {
        this.setState({
          friends: response.data.friends
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  toggleFriend(userId, friendId, isFriend) {
    var method = isFriend ? 'rmFriend' : 'addFriend';
    axios.post('/friends', { method, friendId, userId })
      .then((response) => {
        this.getFriendsList(this.state.loggedInUserId);
      })
      .catch((error) => {
        console.log('error in toggleFriend (index.jsx)')
      });
  }

  //Notiifications
  newNotification(notif) {
    this.setState({
      notifications: [...this.state.notifications, notif]
    });
  }

  newMessage(message) {
    this.setState({
      messages: [...this.state.messages, message]
    });
  }

  clearMessagesForUser(user) {
    console.log('username is ', user);
    var keepTheseMessages = this.state.messages.filter(msg => {
      return msg.user !== user
    })
    this.setState({
      messages: keepTheseMessages
    })
  }

  logUserIn(userId) {
    // set the userId in the userInfo object as soon as the user logs in
    var obj = this.state.userInfo;
    obj.userId = userId;
    this.setState({
      isLoggedIn: true,
      userInfo: obj,
      loggedInUserId: userId
    })
    this.loadUserData(userId);
  }

  logUserOut() {
    this.setState({
      isLoggedIn: false,
      globalFeed: {},
      userFeed: {},
      balance: null,
      userInfo: {},
      friends: [],
      socket: null
    })
  }

  render () {
    const HomeWithProps = (props) => {
      return (
        <div>
          {!this.state.isLoggedIn 
            ? <LoggedOutHome 
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                {...props}
              />
            : <Home
                refreshUserData={this.refreshUserData.bind(this)}
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                userFeed={this.state.userFeed} 
                loadMoreFeed={this.loadMoreFeed.bind(this)}
                globalFeed={this.state.globalFeed}
                userInfo={this.state.userInfo}
                balance={this.state.balance}
                friends={this.state.friends}
                socket={this.state.socket}
                newMessage={this.newMessage.bind(this)}
                newNotification={this.newNotification.bind(this)}
                clearMessagesForUser={this.clearMessagesForUser.bind(this)}
                messages={this.state.messages}
                notifications={this.state.notifications}
                {...props}
              />
          }
        </div>
      );
    };

    const ProfileWithProps = (routeProps) => {
      return (
        <div>
          {!this.state.isLoggedIn 
            ? <LoggedOutHome 
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                {...routeProps}
              />
            : <Profile 
                key={routeProps.location.pathname}
                refreshUserData={this.refreshUserData.bind(this)}
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                userInfo={this.state.userInfo}
                friends={this.state.friends}
                toggleFriend={this.toggleFriend.bind(this)}
                loggedInUserId={this.state.loggedInUserId}
                socket={this.state.socket}
                clearMessagesForUser={this.clearMessagesForUser.bind(this)}
                messages={this.state.messages}
                notifications={this.state.notifications}
                {...routeProps} 
              />
          }
        </div>
      );
    };

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <BrowserRouter>
          <Switch>
            <Route 
              exact path="/signup" 
              render={routeProps => <SignUp {...routeProps} logUserIn={this.logUserIn.bind(this)} />} 
            />
            <Route 
              exact path="/login" 
              render={routeProps => <Login {...routeProps} logUserIn={this.logUserIn.bind(this)} />} 
            />
            <Route 
              path="/:username"
              onEnter={ this.requireAuth }
              render={ProfileWithProps}
            />
            <Route 
              path="/" 
              render={HomeWithProps} 
            />
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
