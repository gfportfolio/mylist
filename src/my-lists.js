class MyLists extends Polymer.Element {
  static get is() {
    return 'my-lists';
  }
  static get properties() {
    return {
      route: {
        type: Object,
        observer: '_routeChanged',
      },
          lists: {
            type: Array,
          },
          selectedItems: {
            type: Array,
            notify: true,
            observer: '_selectedItemsChanged',
          },
          isActive: {type: Boolean}
    }
  }
  ready() {
    super.ready();
  }

  static get observers() {
    return ['_selectedItemsChanged(selectedItems.splices)']
  }
  _selectedItemsChanged(selectedItems) {
    if (this.selectedItems) {
      this.dispatchEvent(new CustomEvent('itemsSelected', {detail: this.selectedItems, bubbles: true, composed: true}));
    }
  }

  editItem() {
    if (!this.isActive) {
      return;
    }
    this.set('route.path', 'list-items/');
    this.set('route.data.selected', this.selectedItems[0]);
  }

  deleteItems() {
    if (!this.isActive) {
      return;
    }
    this.selectedItems.forEach(
        element => {firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists').doc(element.id).delete().then(function() {
          console.log(`list ${element.id} deleted`);
        })

        });
  }

  _routeChanged(route) {
    this.isActive = false;
    if (route.path === '/lists/') {
      this.isActive = true;
    }
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
        var data = doc.data();
        recievedLists.push({id: doc.id, items: data.items, name: data.name, owner: data.owner});
      });
      self.set('lists', recievedLists);
    });
  }

  fabClick() {
    console.log('fab');
    this.set('route.path', 'list-add/');
  }

  countItems(items) {
    return typeof(items) == Array ? items.length : 0;
  }
}

window.customElements.define(MyLists.is, MyLists);