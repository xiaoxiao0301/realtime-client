import { useEffect, useRef, useState } from "react";
import { FiRefreshCcw, FiUpload, FiDownload, FiTrash2, FiX } from "react-icons/fi";
import RealtimeClient from "./RealtimeClient";
import "./App.css";

// Use environment variable for WebSocket URL, fallback to localhost for development
const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8787/ws";
const clientSocket = new RealtimeClient(WS_URL);

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
  messagesContainer: {
    flex: 1,
    minHeight: "250px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    marginBottom: "10px",
  },
  messageInput: {
    minHeight: "60px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    outline: "none",
    whiteSpace: "pre-wrap",
    backgroundColor: "#fff",
    position: "relative",
  },
  messageItem: {
    background: "#fff",
    padding: "8px 12px",
    margin: "4px 0",
    borderRadius: "6px",
    wordWrap: "break-word",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  message: {
    background: "#f3f3f3",
    padding: "6px 12px",
    margin: "4px 0",
    borderRadius: "6px",
    wordWrap: "break-word",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: "420px",
    minHeight: "220px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    position: "relative",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  closeIcon: {
    cursor: "pointer",
    color: "#888",
  },
  uploadButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  progressBarContainer: {
    width: "100%",
    height: "8px",
    backgroundColor: "#eee",
    borderRadius: "4px",
    marginTop: "10px",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#28a745",
    borderRadius: "4px",
  },
  successText: {
    color: "#28a745",
    marginTop: "8px",
    textAlign: "center",
  },
  fileListItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f9f9f9",
    borderRadius: "8px",
    padding: "8px 12px",
    marginBottom: "8px",
  },
  downloadButton: {
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
  },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);

  const messageAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    clientSocket.connect();

    // clientSocket.on('initialMessages', (msg) => {
    //   setMessages(msg || []);
    // });

    // clientSocket.on('messageBroadcast', (msg) => {
    //   setMessages((prevMessages) => [...prevMessages, msg]);
    // });

    // clientSocket.on('messagesCleared', () => {
    //   setMessages([]);
    // });

    // 监听实时新消息
    clientSocket.on('newMessage', (message) => {
      console.log('Received newMessage:', message);
      setMessages((prevMessages) => {
        // 避免重复消息
        const isDuplicate = prevMessages.some(msg => msg.time === message.time && msg.id === message.id);
        if (isDuplicate) return prevMessages;
        return [...prevMessages, message];
      });
    });

    clientSocket.on('latestMessagesResponse', (latestMessages) => {
      console.log('Received latestMessagesResponse:', latestMessages);
      if(latestMessages && latestMessages.length > 0) {
        setMessages((prevMessages) => {
          // 避免重复消息
          const newMessages = latestMessages.filter(newMsg => 
            !prevMessages.some(prevMsg => prevMsg.time === newMsg.time && prevMsg.id === newMsg.id)
          );
          return [...prevMessages, ...newMessages];
        });
      }
    });

    clientSocket.on('latestFilesResponse', (newFiles) => {
      console.log('Received latestFilesResponse:', newFiles);
      if(newFiles && newFiles.length > 0) {
        // setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setFiles(newFiles);
      }
    });

    // clientSocket.on('patchUpdate', (patchText) => {
    //   console.log('Received patchUpdate:', patchText);
    //   const patches = dmp.patch_fromText(patchText);
    //   const [newMessage, ] = dmp.patch_apply(patches, messageAreaRef.current.innerText);
    //   messageAreaRef.current.innerText = newMessage;
    //   setMessages((prevMessages) => [...prevMessages, newMessage]);
    //   lastMessageRef.current = newMessage;
    // });

    return () => {
      // clientSocket.off('initialMessages');
      // clientSocket.off('messageBroadcast');
      // clientSocket.off('messagesCleared');
      clientSocket.off('newMessage');
      clientSocket.off('latestMessagesResponse');
      // clientSocket.off('patchUpdate');
      clientSocket.off('latestFilesResponse');
      clientSocket.disconnect();
    }
  }, []);

  // message logic
  const handleSendMessage = () => {
    const messageText = messageAreaRef.current.innerText.trim();
    if(!messageText) return;
    
    // 发送纯文本消息，不使用patch格式
    clientSocket.send('postMessage', messageText);
    
    // 清空输入框
    messageAreaRef.current.innerText = '';
    
    // 重新聚焦到输入框
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
    const lastime = messages.length > 0 ? messages[messages.length -1].time : 0;
    clientSocket.send('latestMessages', { after: lastime});
  }

  const handleClear = () => {
    console.log('Clearing messages', messages);
    setMessages([]);
    // clientSocket.emit('clearMessages');
    setFiles([]);
  }

  // upload logic
  const handleUploadClick = () => setShowUploadModal(true);

  const handleCloseUploadArea = () => {
    setShowUploadModal(false);
    setUploadProgress(0);
    setUploadSuccess(false);
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if(!file) return;
    uploadFile(file);
  }

  const handleDrop = (e) => { 
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if(!file) return;
    uploadFile(file);
  }

  const handleDragOver = (e) => e.preventDefault();

  const uploadFile = (file) => {
    setUploadProgress(0);
    setUploadSuccess(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result.split(',')[1];
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: base64,
      };
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if(progress >= 100) {
          clearInterval(interval);
          clientSocket.send('postFile', fileData);
          setUploadSuccess(true);

          // ✅ 自动刷新文件列表
          // clientSocket.emit("latestFiles", { after: 0 });
          
          // ✅ 上传完成后自动关闭弹窗
          setTimeout(() => {
            setShowUploadModal(false);
            setUploadProgress(0);
            setUploadSuccess(false);
          }, 1000);

        }
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  // download logic
  const handleDownload = () => {
    const lasttime = files.length > 0 ? files[files.length -1].time : 0;
    clientSocket.send('latestFiles', { after: lasttime}); 
    setShowDownloadModal(true);
  }

  const handleCloseDownloadModal = () => setShowDownloadModal(false);

  const handleDownloadFile = (fileMsg) => {
    const blob = new Blob([Uint8Array.from(atob(fileMsg.content), c => c.charCodeAt(0))], { type: fileMsg.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileMsg.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>🧩 RealTime Message</h2>

        <div style={styles.buttonRow}>
          <button style={styles.iconButton} onClick={handleRefresh} title="Refresh">
            <FiRefreshCcw size={20} />
          </button>
          <button style={styles.iconButton} onClick={handleUploadClick} title="Upload">
            <FiUpload size={20} />
          </button>
          <button style={styles.iconButton} onClick={handleDownload} title="Download">
            <FiDownload size={20} />
          </button>
          <button style={{ ...styles.iconButton, background: "#dc3545" }} onClick={handleClear} title="Delete All">
            <FiTrash2 size={20} /> 
          </button>
        </div>

        {/* 消息显示区域 */}
        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <div key={`${msg.id}-${msg.time}-${index}`} style={styles.messageItem}>
              {msg.text}
            </div>
          ))}
        </div>
        
        {/* 消息输入区域 */}
        <div
          ref={messageAreaRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          style={styles.messageInput}
          className="message-input"
          data-placeholder="输入消息，按Enter发送..."
        >
        </div>

        {showUploadModal && (<>
        <div
          style={styles.modalOverlay}
          onClick={handleCloseUploadArea}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div style={styles.modalHeader}>
              <h3>上传文件</h3>
              <FiX style={styles.closeIcon} onClick={handleCloseUploadArea} />
            </div>

            <button style={styles.uploadButton} onClick={() => fileInputRef.current.click()}>选择文件</button>

            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />

            {uploadProgress > 0 && (
              <div style={styles.progressBarContainer}>
                <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }}></div>
              </div>
            )}

            {uploadSuccess && <div style={styles.successText}>Upload Successful!</div>}
          </div>
        </div>
        </>)}
        
        {showDownloadModal && (<>
          <div style={styles.modalOverlay} onClick={handleCloseDownloadModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3>文件列表</h3>
                <FiX style={styles.closeIcon} onClick={handleCloseDownloadModal} />
              </div>

              {files.length === 0 ? (
                <p>暂无可下载文件</p>
              ) : (
              // const fileName = file.name || file.filename || file.fileName || file.originalname || "未命名文件";
              // const fileSize = file.size ? (file.size / 1024).toFixed(1) : "未知";
                files.map((file, idx) => (
                  <div key={idx} style={styles.fileListItem}>
                    <span>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      style={styles.downloadButton}
                      onClick={() => handleDownloadFile(file)}
                    >
                      下载
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

export default App;
