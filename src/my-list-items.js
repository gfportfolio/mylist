class MyListItems extends Polymer.Element {
  static get is() {
    return 'my-list-items';
  }
  static get properties() {
    return {
      route: {
        type: Object,
        observer: '_routeChanged',
      },
          routeData: {
            type: Object,
          },
          listId: {type: String}, items: {type: Object}, selectedItems: {type: Array, notify: true, observer: '_selectedItemsChanged'}, isActive: {type: Boolean}
    }
  }
  static get observers() {
    return ['_selectedItemsChanged(selectedItems.splices)']
  }

  _selectedItemsChanged(selectedItems) {
    if (this.selectedItems) {
      this.dispatchEvent(new CustomEvent('itemsSelected', {detail: this.selectedItems, bubbles: true, composed: true}));
    }
  }

  _routeChanged(route) {
    this.isActive = false;
    if (this.routeData.page === 'list-items') {
      this.isActive = true;
      let listId = this.routeData.listId;
      if (this.listId !== listId) {
        this._loadListData(listId);
      }
    }
  }

  _loadListData(listId) {
    let self = this;
    this.listId = listId;
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists').doc(listId).collection('items').onSnapshot(function(recievedData) {
      let recievedItems = [];
      recievedData.docs.forEach(function(doc) {
        var data = doc.data();
        recievedItems.push({id: doc.id, name: data.name, purchased: data.purchased, url: data.url, photoUrl: data.photoUrl});
      });
      self.set('items', recievedItems);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.loadUsersLists();
      }
    });
  }

  loadUsersLists() {
    let self = this;
    self.lists = [];
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists').onSnapshot(function(recievedData) {
      let recievedLists = [];
      recievedData.docs.forEach(function(doc) {
        recievedLists.push(doc.data());
      });
      self.set('lists', recievedLists);
    });
  }

  fabClick() {
    console.log('fab');
    this.set('route.path', `list-items-add/${this.listId}`);
  }

  countItems(items) {
    return typeof(items) == Array ? items.length : 0;
  }
}

window.customElements.define(MyListItems.is, MyListItems);