
class MyListAdd extends Polymer.Element {
  static get is() {
    return 'my-list-add';
  }

  static get properties() {
    return {userId: {type: Number}, route: {type: Object}};
  }

  submitClick() {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('lists').add({name: this.$.nameInput.value, owner: this.$.ownerInput.value});
    this.set('route.path', 'lists/');
  }
}
window.customElements.define(MyListAdd.is, MyListAdd);