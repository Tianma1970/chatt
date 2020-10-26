//Get peer id (hash) from URL
const peerId = location.hash.slice(1)

//Connect to peer server

peer = new Peer(peerId, {
  host: "glajan.com",
  port: 8443,
  path: "/myapp",
  secure: true
})

peer.on("open", id => {
  const peerIdEl = document.querySelector(".my-peer-id")

  peerIdEl.innerText = id
})

// Event listener for click "Refresh list"
const refreshPeersListButtonEl = document.querySelector(".list-all-peers-button")
refreshPeersListButtonEl.addEventListener("click", () => {
  peer.listAllPeers(peers => {
    const peerListEl = document.querySelector(".peers-container")
    peerListEl.innerText = peers

    console.log(listAllPeers)
  })
  console.log("click")
})
