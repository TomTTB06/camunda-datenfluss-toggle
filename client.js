// Data Flow Toggle: hides/shows data associations, data objects and data stores
// with a single button. No build step, no dependencies.
//
// How it works (cheap): every data element gets the CSS class "dft-data" once,
// when it is added. The button only toggles one class on the canvas container,
// and CSS does the hiding. Toggling never iterates over the elements.
(function () {
  var TYPES = [
    'bpmn:DataInputAssociation',
    'bpmn:DataOutputAssociation',
    'bpmn:DataObjectReference',
    'bpmn:DataStoreReference'
  ];

  function isDataFlow(element) {
    var bo = element.businessObject;
    return !!bo && TYPES.some(function (type) { return bo.$instanceOf(type); });
  }

  function DataFlowToggle(eventBus, canvas) {
    var container = canvas.getContainer();
    var button = document.createElement('button');
    button.className = 'dft-toggle';

    function setHidden(hidden) {
      container.classList.toggle('dft-hidden', hidden);
      button.textContent = hidden ? 'Show data flows' : 'Hide data flows';
    }

    button.addEventListener('click', function () {
      setHidden(!container.classList.contains('dft-hidden'));
    });

    container.appendChild(button);
    setHidden(false);

    // also applies to labels, since they share the same businessObject
    eventBus.on([ 'shape.added', 'connection.added' ], function (event) {
      if (isDataFlow(event.element)) {
        event.gfx.classList.add('dft-data');
      }
    });
  }

  DataFlowToggle.$inject = [ 'eventBus', 'canvas' ];

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
