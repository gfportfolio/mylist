class MyApp extends Polymer.Element {
  static get is() {
    return 'my-app';
  }

  static get properties() {
    return {
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged',
      },
      selectedItems: {
        type: Array,
        reflectToAttribute: true,
      },
      toolbar: {type: String, value: 'main'},
      routeData: Object,
      subroute: String,
      // This shouldn't be neccessary, but the Analyzer isn't picking up
      // Polymer.Element#rootPath
      rootPath: String,
      user: Object,
      selectedUserId: Object,
      isAuthenticated: {
        type: Boolean,
        value: false,
      },
      singleItemSelected: {type: Boolean, value: false}
    };
  }

  ready() {
    super.ready();
    this.addEventListener('itemsSelected', this._itemsSelected);
    if (firebase.apps.length === 0) {
      firebase.initializeApp(config);
    }
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user;
        this.selectedUserId = user.id;
        this.isAuthenticated = true;
        console.log('User is signed in.');
        if (this.page === '') {
          this.page = 'lists';
          this.set('route.path', 'lists/');
        }
      } else {
        /// TODO: toast
        // this.$.loginModel.open();
        console.log('User is signed out.');
        this.isAuthenticated = false;
        this.page = 'signin'
      }
    });
  }
  static get observers() {
    return [
      '_routePageChanged(routeData.page)',
    ];
  }

  _itemsSelected(event) {
    var items = event.detail;
    this.selectedItems = event.detail;
    if (items && items.length > 0) {
      this.toolbar = 'selected';
    } else {
      this.toolbar = 'main';
    }
    this.singleItemSelected = items.length == 1;
  }

  toolbarEditTap() {
    this.$.myLists.editItem();
    if (this.$.myListItems.editItem) {
      this.$.myListItems.editItem();
    }
    this.toolbar = 'main';
  }

  toolbarDeleteTap() {
    this.$.myLists.deleteItems();
    if (this.$.myListItems.editItem) {
      this.$.myListItems.deleteItems();
    }
    this.toolbar = 'main';
  }

  _routePageChanged(page) {
    // If no page was found in the route data, page will be an empty string.
    // Default to 'view1' in that case.
    this.page = page || 'my-lists';

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  async authenticateUser() {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    try {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      let result = await firebase.auth().signInWithPopup(provider);
      this.user = result.user;
    } catch (error) {
      console.log(`signin error ${error} `)
    };
  }

  signOutUser() {
    this.$.signoutdialog.close();
    firebase.auth().signOut();
    this.page = 'signin';
    this.user = '';
  }

  openSignOutDialog() {
    console.log('open signeout dialog');
    this.$.signoutDialog.open();
  }

  _pageChanged(page) {
    // Load page import on demand. Show 404 page if fails
    var resolvedPageUrl = this.resolveUrl('my-' + page + '.html');
    Polymer.importHref(resolvedPageUrl, null, this._showPage404.bind(this), true);
  }

  _showPage404() {
    this.page = 'view404';
  }
}

window.customElements.define(MyApp.is, MyApp);