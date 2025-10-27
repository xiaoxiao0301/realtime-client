import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FiRefreshCcw, FiUpload, FiDownload, FiTrash2 } from "react-icons/fi";

const clientSocket = io("http://localhost:3001");

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    maxWidth: "calc(100% - 400px)",
    margin: "40px 200px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "20px",
    marginBottom: "20px",    
  },
  iconButton: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messageArea: {
    flex: 1,
    minHeight: "300px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    overflowY: "auto",
    outline: "none",
    whiteSpace: "pre-wrap",
  },
  message: {
    background: "#f3f3f3",
    padding: "6px 12px",
    margin: "4px 0",
    borderRadius: "6px",
    wordWrap: "break-word",
  },
};

function App() {
  const [messages, setMessages] = useState([]);
  const messageAreaRef = useRef(null);

  useEffect(() => {
    clientSocket.on('initialMessages', (msg) => {
      setMessages(msg || []);
    });

    clientSocket.on('messageBroadcast', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // clientSocket.on('messagesCleared', () => {
    //   setMessages([]);
    // });

    clientSocket.on('latestMessagesResponse', (msg) => {
      setMessages(msg || []);
    });


    return () => {
      clientSocket.off('initialMessages');
      clientSocket.off('messageBroadcast');
      // clientSocket.off('messagesCleared');
      clientSocket.off('latestMessagesResponse');
    }
  }, []);

  const handleSendMessage = () => {
    const messageText = messageAreaRef.current.innerText.trim();
    if(!messageText) return;
    clientSocket.emit('newMessage', messageText);
    messageAreaRef.current.innerText = '';
    setTimeout(() => {
      const el = messageAreaRef.current;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }, 100);
  };  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } 
  }

  const handleRefresh = () => {
    clientSocket.emit('latestMessages');
  }

  const handleUpload = () => {
    alert('Upload clicked');
  }

  const handleDownload = () => {
    alert('Download clicked');
  }

  const handleClear = () => {
    setMessages([]);
    // clientSocket.emit('clearMessages');
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>🧩 RealTime Message</h2>

        <div style={styles.buttonRow}>
          <button style={styles.iconButton} onClick={handleRefresh} title="Refresh">
            <FiRefreshCcw size={20} />
          </button>
          <button style={styles.iconButton} onClick={handleUpload} title="Upload">
            <FiUpload size={20} />
          </button>
          <button style={styles.iconButton} onClick={handleDownload} title="Download">
            <FiDownload size={20} />
          </button>
          <button style={{ ...styles.iconButton, background: "#dc3545" }} onClick={handleClear} title="Delete All">
            <FiTrash2 size={20} /> 
          </button>
        </div>

        <div
          ref={messageAreaRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          style={styles.messageArea}
        >
          {messages.map((msg) => (
            <div key={msg.id} style={styles.message}> { msg.text } </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
