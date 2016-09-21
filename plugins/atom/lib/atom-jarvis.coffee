AtomJarvisView = require './atom-jarvis-view'
{Workspace, CompositeDisposable, TextEditor} = require 'atom'
io = require('socket.io-client')('http://localhost:3000')
vm = require('vm')


io.emit('atom-connected');
module.exports = AtomJarvis =
  atomJarvisView: null
  modalPanel: null
  subscriptions: null
  socket: io
  name: null

  activate: (state) ->
    # @socket.emit 'set cwd', '/home/parties/code/gojarvis/'
    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-jarvis:toggle': => @toggle()
    @subscriptions.add atom.workspace.onDidOpen (file) => @handleOpen 'open', {uri: file.uri, index: file.index, file:file}, { }
    @subscriptions.add atom.workspace.onDidDestroyPaneItem (context) => @handleClose context.item.getURI(), { }
    @subscriptions.add atom.workspace.observeTextEditors (editor) => @handleEditor editor
    @subscriptions.add atom.workspace.onDidChangeActivePaneItem (item) => @handleHighlighted item
    # @subscriptions.add @socket.on 'run cmd', (cmd) => @runCommand cmd
    # @subscriptions.add @socket.on 'list files', (files) => console.log 'P.onFiles:', files
    # @subscriptions.add @socket.on 'name', (name) => @handleName name
    # @subscriptions.add @socket.on 'context', (context) => @handleContext context

    atom.packages.onDidActivateInitialPackages =>
      createStatusEntry = =>
        @atomJarvisView = new AtomJarvisView(state.atomJarvisViewState)
      createStatusEntry()
    # @modalPanel = atom.workspace.addModalPanel(item: @atomJarvisView.getElement(), visible: false)
    # leaving this out for now, as it triggers for both file open and tab creation, tripping up the events (for some reason)
    # @subscriptions.add atom.workspace.onDidAddPaneItem (context) => @emitEvent('tab open', {uri: context.item.getURI()})


    # @socket.emit 'give context'

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @atomJarvisView.destroy()

  serialize: ->
    # atomJarvisViewState: @atomJarvisView.serialize()

  handleContext: (context) ->
    console.log('P.handleContext: ', context)
    context.files.forEach (item) ->
      atom.workspace.open(item)

  filesAction: (action, file, context) ->
    context.action = action
    context.target = file
    @emitEvent 'files', context


  handleOpen: (uri) ->
    @socket.emit('atom-file-open', {uri: uri});

  handleClose: (uri) ->
    @socket.emit('atom-file-close', {uri: uri});

  emitEvent: (eventName, eventObj) ->
    console.info 'P.emitEvent: ' + eventName + ':', eventObj
    @socket.emit eventName, eventObj

  handleEditor: (editor) ->
    @socket.emit('atom-file-observed', {uri: editor.getURI()});
    @subscriptions.add editor.onDidSave (event) => @emitEvent 'atom-file-saved', {uri: editor.getURI()}
    # @subscriptions.add editor.onDidChangeSelectionRange (event) => @emitEvent 'atom-selection', {uri: editor.getURI(), selection: event.selection}

  handleHighlighted: (item) ->
    # TODO: check for item === undefined
    if item && item.getPath
      uri = item.getPath()
    else if item && item.getURI
      uri = item.getURI()
    @socket.emit('atom-highlighted', {uri: uri});


  runCommand: (cmd) ->
    console.info 'P.runCommand: ', cmd
    vm.runInThisContext(cmd)

  handleName: (name) ->
    console.info('P.handleName: ', name)
    @name = name

  toggle: ->
    console.log 'P.toggle'
