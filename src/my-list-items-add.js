
class MyListItemsAdd extends Polymer.Element {
  static get is() {
    return 'my-list-items-add';
  }

  static get properties() {
    return {
      userId: {type: Number},
      route: {type: Object},
      routeData: {type: Object, observer: '_routeChanged'},
      isActive: {type: Boolean},
      listId: {type: String},
    };
  }

  submitClick() {
    if (this.listId !== undefined) {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('lists').doc(this.listId).collection('items').add({name: this.$.nameInput.value, url: this.$.urlInput.value, photoUrl: this.$.photoUrlInput.value, purchased: this.$.purchasedInput.checked});
      this.set('route.path', `lists-items/${this.listId}`);
    }
  }

  _routeChanged(route) {
    this.isActive = false;
    if (this.routeData.page === 'list-items-add') {
      this.isActive = true;
      this.listId = this.routeData.listId;
    }
  }
}
window.customElements.define(MyListItemsAdd.is, MyListItemsAdd);