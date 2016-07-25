'use babel';

import SherpaViewView from './sherpa-view-view';
import { CompositeDisposable } from 'atom';

export default {

  sherpaViewView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.sherpaViewView = new SherpaViewView(state.sherpaViewViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sherpaViewView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sherpa-view:toggle': () => this.toggle(),
      'sherpa-view:showPanel': () => this.showPanel()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sherpaViewView.destroy();
  },

  serialize() {
    return {
      sherpaViewViewState: this.sherpaViewView.serialize()
    };
  },

  showPanel(){
    var zoomba = document.createElement('div');
    zoomba.innerHTML = '<span class="sherpa-panel"><iframe id="sviewport" class="sherpa-viewport" src="http://localhost:8888"></iframe></span>';
    // zoomba.textContent('Hello');
    atom.workspace.addRightPanel({
      item: zoomba
    });
    document.getElementById('sviewport').style.height = document.body.scrollHeight +'px';

  },

  toggle() {
    console.log('SherpaView was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
