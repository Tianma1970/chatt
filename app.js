//anonym function
;(function () {
  //our querySelectors
  //Event Listener for click peer button
  const peers = document.querySelector(".peers")
  peers.addEventListener("click", event => {
    if (!event.target.classList.contains("connect-button")) return
    //console.log(event.target.innerText)
    const peerName = event.target.innerText
    console.log(peerName)
  })
  //Get peer id (hash) from URL
  const peerId = location.hash.slice(1)

  //Connect to peer server

  let peer = new Peer(peerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true
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
          return `<li><button class="connect-button">${peer}</button></li>`
        })
        .join("")

      const ulEl = document.createElement("ul")
      ulEl.innerHTML = peerEl
      peerListEl.appendChild(ulEl)
    })
    console.log("click")
  })
})() //end of anonym function. you need to add '()'
