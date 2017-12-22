
  class MyListAdd extends Polymer.Element {
    static get is() {
      return 'my-list-add';
    }

    static get properties() {
      return {
        userId: {
          type: Number
        },
      };
    }

    submitClick() {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists').add({
        name: this.$.nameInput.value,
        owner: this.$.ownerInput.value
      });
    }

  }
  window.customElements.define(MyListAdd.is, MyListAdd);