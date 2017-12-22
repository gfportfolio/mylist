class MyLists extends Polymer.Element {
    static get is() {
      return 'my-lists';
    }
    static get properties() {
      return {
        route: {
          type: Object
        },
        lists: {
          type: Array,
        },
        selectedItems: {
          type: Array,
          notify: true,
          observer: '_selectedItemsChanged',
        }
      }
    }
    static get observers() {
      return [
        '_selectedItemsChanged(selectedItems.splices)'
      ]
    }
    _selectedItemsChanged(selectedItems) {
      if (this.selectedItems) {
        this.dispatchEvent(new CustomEvent('itemsSelected', {
          detail: this.selectedItems,
          bubbles: true,
          composed: true
        }));
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
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists')
        .onSnapshot(function (recievedData) {
          let recievedLists = [];
          recievedData.docs.forEach(function (doc) {
            recievedLists.push(doc.data());
          });
          self.set('lists', recievedLists);
        });
    }

    fabClick() {
      console.log("fab");
      this.set('route.path', 'list-add/');
    }

    countItems(items) {
      return typeof (items) == Array ? items.length : 0;
    }
  }



  window.customElements.define(MyLists.is, MyLists);