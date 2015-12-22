AtomSherpaView = require './atom-sherpa-view'
{Workspace, CompositeDisposable, TextEditor} = require 'atom'
io = require('socket.io-client')('http://localhost:3000')
vm = require('vm')

module.exports = AtomSherpa =
  atomSherpaView: null
  modalPanel: null
  subscriptions: null
  socket: io
  name: null

  activate: (state) ->
    @socket.emit 'set cwd', '/home/parties/code/gojarvis/'
    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-sherpa:toggle': => @toggle()
    @subscriptions.add atom.workspace.onDidOpen (file) => @filesAction 'open', {uri: file.uri, index: file.index}, { }
    @subscriptions.add atom.workspace.onDidDestroyPaneItem (context) => @filesAction 'close', {uri: context.item.getPath()}, { }
    @subscriptions.add atom.workspace.observeTextEditors (editor) => @handleEditor editor
    @subscriptions.add @socket.on 'run cmd', (cmd) => @runCommand cmd
    @subscriptions.add @socket.on 'files', (files) => console.log 'P.onFiles:', files
    @subscriptions.add @socket.on 'name', (name) => @handleName name
    @subscriptions.add @socket.on 'context', (context) => @handleContext context

    atom.packages.onDidActivateInitialPackages =>
      createStatusEntry = =>
        @atomSherpaView = new AtomSherpaView(state.atomSherpaViewState)
      createStatusEntry()
    # @modalPanel = atom.workspace.addModalPanel(item: @atomSherpaView.getElement(), visible: false)

    # leaving this out for now, as it triggers for both file open and tab creation, tripping up the events (for some reason)
    # @subscriptions.add atom.workspace.onDidAddPaneItem (context) => @emitEvent('tab open', {uri: context.item.getPath()})

    @socket.emit 'give context'

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @atomSherpaView.destroy()

  serialize: ->
    # atomSherpaViewState: @atomSherpaView.serialize()

  handleContext: (context) ->
    console.log('P.handleContext: ', context)
    context.files.forEach (item) ->
      atom.workspace.open(item)

  filesAction: (action, file, context) ->
    context.action = action
    context.target = file
    @emitEvent 'files', context


  emitEvent: (eventName, eventObj) ->
    console.info 'P.emitEvent: ' + eventName + ':', eventObj
    @socket.emit eventName, eventObj

  handleEditor: (editor) ->
    @subscriptions.add editor.onDidSave (event) => @emitEvent 'file saved', {uri: editor.getPath()}

  runCommand: (cmd) ->
    console.info 'P.runCommand: ', cmd
    vm.runInThisContext(cmd)

  handleName: (name) ->
    console.info('P.handleName: ', name)
    @name = name

  toggle: ->
    console.log 'P.toggle'

    # if @modalPanel.isVisible()
      # @modalPanel.hide()
    # else
      # @modalPanel.show()
