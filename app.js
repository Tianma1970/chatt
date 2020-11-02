//anonym function
;(function () {
  //our querySelectors
  //Event Listener for click peer button
  const peers = document.querySelector(".peers")

  //Get peer id (hash) from URL
  const peerId = location.hash.slice(1)

  //Connect to peer server

  let peer = new Peer(peerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { urls: ["stun:eu-turn7.xirsys.com"] },
        {
          username: "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          urls: ["turn:eu-turn7.xirsys.com:80?transport=udp", "turn:eu-turn7.xirsys.com:3478?transport=udp", "turn:eu-turn7.xirsys.com:80?transport=tcp", "turn:eu-turn7.xirsys.com:3478?transport=tcp", "turns:eu-turn7.xirsys.com:443?transport=tcp", "turns:eu-turn7.xirsys.com:5349?transport=tcp"]
        }
      ]
    }
  })

  peer.on("open", id => {
    const peerIdEl = document.querySelector(".my-peer-id")

    peerIdEl.innerText = id
  })
  //we need to ensure, we are connected to the server
  peer.on("error", errorMessage => {
    console.error(errorMessage)
  })

  // Event listener for click "Refresh list"
  const refreshPeersListButtonEl = document.querySelector(".list-all-peers-button")
  refreshPeersListButtonEl.addEventListener("click", () => {
    peer.listAllPeers(peers => {
      const peerListEl = document.querySelector(".peers")
      const peerEl = peers
        .filter(peerId => {
          if (peerId === peer._id) return false
          return true
        }) //remove our own name
        .map(peer => {
          return `<li><button class="connect-button peerId-${peer}">${peer}</button></li>`
        })
        .join("")

      const ulEl = document.createElement("ul")
      ulEl.innerHTML = peerEl
      peerListEl.appendChild(ulEl)
    })
  })
  //connect to peer
  peers.addEventListener("click", event => {
    if (!event.target.classList.contains("connect-button")) return

    const peerName = event.target.innerText
    const theirPeerId = event.target.innerText
    const dataConnection = peer.connect(theirPeerId)
    dataConnection.on("open", () => {
      console.log("connection open")
      //Dispatch Custom Event with connected peer id
      const event = new CustomEvent("peer-changed", {
        detail: theirPeerId
      })
      document.dispatchEvent(event)
    })
    //listen for custom event "peer-changed"
    document.addEventListener("peer-changed", event => {
      console.log(event)
    })
  })

  document.addEventListener("peer-changed", e => {
    console.log(e)
    const peerId = e.detail
    console.log(peerId)
    const connectButton = document.querySelector(`.connect-button.peerId-${peerId}`)
    console.log(connectButton)
  })
})() //end of anonym function. you need to add '()'
