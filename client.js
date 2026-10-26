// Data Flow Toggle: hides/shows data associations, data objects and data stores
// (plus text annotations attached to them) with a single button.
// No build step, no dependencies.
//
// How it works (cheap): data elements carry the CSS class "dft-data". It is set
// when an element is added and refreshed only for elements a command changed.
// The button only toggles one class on the canvas container, and CSS does the
// hiding. Toggling never iterates over the elements.
(function () {
  var TYPES = [
    'bpmn:DataInputAssociation',
    'bpmn:DataOutputAssociation',
    'bpmn:DataObjectReference',
    'bpmn:DataStoreReference'
  ];

  function is(element, type) {
    var bo = element && element.businessObject;
    return !!bo && bo.$instanceOf(type);
  }

  function isData(element) {
    return TYPES.some(function (type) { return is(element, type); });
  }

  // association between a text annotation and a data element
  function isDataLink(connection) {
    return is(connection, 'bpmn:Association') &&
      (isData(connection.source) || isData(connection.target));
  }

  function DataFlowToggle(eventBus, canvas, elementRegistry) {
    var container = canvas.getContainer();
    var button = document.createElement('button');
    button.className = 'dft-toggle';

    function isHidden() {
      return container.classList.contains('dft-hidden');
    }

    function setHidden(hidden) {
      container.classList.toggle('dft-hidden', hidden);
      button.textContent = hidden ? 'Show data flows' : 'Hide data flows';
    }

    button.addEventListener('click', function () {
      setHidden(!isHidden());
    });

    container.appendChild(button);
    setHidden(false);

    // ignored: a connection that is being removed but is still referenced
    function shouldHide(element, ignored) {
      if (isData(element) || isDataLink(element)) {
        return true;
      }

      // text annotation connected to a data element
      if (is(element, 'bpmn:TextAnnotation')) {
        return (element.incoming || []).concat(element.outgoing || []).some(function (c) {
          return c !== ignored && isDataLink(c);
        });
      }

      return false;
    }

    function mark(element, ignored) {
      var gfx = element && elementRegistry.getGraphics(element);

      if (gfx) {
        gfx.classList.toggle('dft-data', shouldHide(element, ignored));
      }
    }

    // a connection can change whether its ends (e.g. an annotation) are hidden
    function markWithEnds(element) {
      mark(element);

      if (element.waypoints) {
        mark(element.source);
        mark(element.target);
      }
    }

    eventBus.on([ 'shape.added', 'connection.added' ], function (event) {
      markWithEnds(event.element);
    });

    eventBus.on('connection.removed', function (event) {
      mark(event.element.source, event.element);
      mark(event.element.target, event.element);
    });

    eventBus.on('elements.changed', function (event) {
      event.elements.forEach(markWithEnds);
    });

    // show everything again when the user adds a new data element while hidden
    eventBus.on([
      'commandStack.shape.create.postExecuted',
      'commandStack.connection.create.postExecuted'
    ], function (event) {
      var element = event.context.shape || event.context.connection;

      if (isHidden() && shouldHide(element)) {
        setHidden(false);
      }
    });
  }

  DataFlowToggle.$inject = [ 'eventBus', 'canvas', 'elementRegistry' ];

  // equivalent to registerBpmnJSPlugin() from camunda-modeler-plugin-helpers
  var plugins = window.plugins || (window.plugins = []);
  plugins.push({
    type: 'bpmn.modeler.additionalModules',
    plugin: {
      __init__: [ 'dataFlowToggle' ],
      dataFlowToggle: [ 'type', DataFlowToggle ]
    }
  });
})();
