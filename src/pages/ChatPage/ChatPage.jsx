// import PropTypes from 'prop-types';
import styles from './ChatPage.module.css';
import NavBar from '../../components/NavBar/NavBar';
import ChatsList from '../../components/ChatsList/ChatsList';
import SingleChat from '../../components/SingleChat/SingleChat';
import { useState } from 'react';

function ChatPage() {

  const [currentSingleChat, setCurrentSingleChat] = useState(null);


  return (
    <div className={styles.chatPage}>
      <NavBar/>
      <ChatsList onSelectedUserChange={setCurrentSingleChat}/>
      {currentSingleChat && <SingleChat user={currentSingleChat}/>}
    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};