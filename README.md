# Reactjs Dynamic Form

Form generator and handling module built to use with reactjs. Uses reactstrap to
style the forms. 

## Requirements

 - reactjs
 - react-select
 - reactstrap
 - bootstrap

# Installation

Install using yarn or npm

`yarn add reactjs_dynamic_form`

Import 
`import FormFields from 'reactjs_dynamic_form';`

Install other requirements

`yarn add reactstrap@next react react-dom react-select@next bootstrap`

Add imports
`import 'bootstrap/dist/css/bootstrap.min.css';`
`import 'react-select/dist/react-select.css';`

# Usage

This is the basic working demo with most of the features

```javascript
    constructor(props) {
        super(props);
        this.state = {
            // we track which field was changed recently
            whatChanged: null,
            // keep the data isolated from other
            current: {
                eventName: null,
                eventDate: null,
                locationKnown: null,
                location: null,
            }
        };
        this.updateCurrentFieldWithValue = this.updateCurrentFieldWithValue.bind(this);
        this.updateEventDate = this.updateEventDate.bind(this);
    }

    updateEventDate(event) {
        console.log("Setting event Date, field specific event handler");
        var c = this.state.current;
        c.eventDate = event.target.value;
        this.setState({
            current: c,
            whatChanged: event.target.name
        });
    }

    // normal fields sends event object only
    // react-select will send field, val, opt, original. original will contain
    // all the data
    updateCurrentFieldWithValue(field, val, opt, original) {
        console.log("Setting event name, default event handler");
        console.log(field, val, opt, original);
        var c = this.state.current;
        var fname = '';
        try {
            c[field.target.name] = field.target.value;
            fname = field.target.name;
        } catch (e) {
            c[field] = val;
            fname = field;
        }
        this.setState({
            current: c,
            whatChanged: fname
        });
    }

  render() {
    var url = 'https://jsonplaceholder.typicode.com/comments';
    var current = this.state.current;
    var cstate = this.state;
    var fields = {
        name: "NewDataForm",
        defaults: { 
            whatChanged: this.state.whatChanged,
            update: this.updateCurrentFieldWithValue,
            // handling json response, can be overridden in individual 
            // fields
            listing: (json) => {
                console.log(json);
                return json;
            },
        }, 
        layout: [{ 
            // the layout will be bootstrap grid, size is number of cols in each
            // row, each col contain one field
            size: [4, 4, 4],
            fields: [{
                    field: 'eventName',
                    caption: "Event Name", // react components are allowed
                    fieldType: 'text', value: this.state.current.eventName
                }, { 
                    field: 'eventDate', caption: "Event Date", 
                    fieldType: 'date', value:this.state.current.eventDate,
                    update: this.updateEventDate
                }, { // select box using react-select, using fixed data
                    field: "locationKnown", caption: "Location Known",
                    value: this.state.current.locationKnown, fieldType: "select",
                    options: [ { label: "Yes", value: "Yes" },
                               { label: "No", value: "No" },]
                }],
        }, {
            size: [6, 6],
            fields: [{
                    field: 'eventEnded', caption: "Event End Date",
                    fieldType: 'number', value: this.state.current.eventEnded
                }, { // react-select using external source
                    field: 'location',
                    caption: 'Locations', 
                    fieldType: 'select',
                    value: current.location, 
                    // visibility based on another field
                    visible: current.locationKnown === 'Yes',
                    // required or not, based on another field
                    required: this.state.current.locationKnown === 'Yes',
                    source: () => { return url; },
                    // get options
                    optionFunc: (location) => {
                        return {
                            label: location.name,
                            value: location.id
                        }
                    },
                    // when to update
                    changeCondition: () => {
                        return ["locationKnown"].indexOf(cstate.whatChanged) >= 0;
                    }
                }]
        }]
    };
    return (
      <div className="App">
        <Container>
            <header className="App-header">
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <Form key="ParticipantInputForm">
                <FormFields fields={fields} key="whateverItWas" />
            </Form>
        </Container>
      </div>
    );
  }
```

