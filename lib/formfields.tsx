import * as React from 'react';
import {FormFeedback, FormText} from 'reactstrap';
import {Col, Row, Label, Input} from 'reactstrap';
import Select from 'react-select';
import {Creatable as Creatable} from 'react-select';
import {Async as Async} from 'react-select';
import {AsyncCreatable as AsyncCreatable} from 'react-select';


export default class FormFields extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: props.value || ''
        }
    }

    render() {
        const fields = this.props.fields;
        return fields.layout.map((field:any, index:number) => {
            if(field.fields === 'br') {
                return <br key={"br_" + index} />
            } else if(field.fields === 'hr') {
                return <hr key={"hr_" + index}  />
            } else {
                return <Row key={'ffs_' + index } >
                    <FormFieldGroups {...field} 
                            defaults={fields.defaults} />
                </Row>
            }
        });
    }
}


export class InputField extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        let headers = {};
        if('headers' in props) {
            headers = Object.assign({}, headers, props.headers);
        }
        this.state = {
            options: [],
            value: this.props.value || '',
            doUpdate: false,
            headers: headers
        };
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    onSelectChange(sopt:any) {
        this.props.update(this.props.field, sopt.value, sopt);
        this.setState({ value: sopt });
    }

    componentDidCatch(error:any, info:any) {
        // Display fallback UI
        this.setState({ hasError: true });
        // You can also log the error to an error reporting service
        console.log(error, info);
    }

    componentWillReceiveProps(nextProps: any) {
        // are we using select or normal input box? if source is null/undefined then
        // we are using text fields.
        if(!nextProps.source) {
            if(nextProps.value != this.props.value) {
                this.setState({
                    doUpdate: true,
                    value: nextProps.value
                });
            }
            return;
        }
        // check if select field requires updating. We keep track of fields that are
        // being changed in parent component. if we find relevent component has been
        // changed we update this Component too.
        // changeCondition function should be like the follwoing.
        // changeCondition: () => { 
        //   return ['all', null, 'otherFieldName'].indexOf(parent.state.whatChanged) >= 0;
        // }
        if(typeof this.props.changeCondition === 'function' && !this.props.changeCondition()) {
            return;
        }
        let src: string = '';
        let listingFunc: any = null;
        const parent = this;
        // is our source a function or url? if we require to change the url a little
        // we can make it a function that will return the string after making the
        // change. ie;
        //
        // source: () => { 
        //     if(parent.state.current.userIsAdmin === false) {
        //         return null;
        //     }
        //     return parent.links.userRoles + parent.state.currentUserId; 
        // },
        if(typeof nextProps.source === 'function') {
            src = nextProps.source();
            if(src == null) {
                return;
            }
        } else {
            src = nextProps.source;
        }
        // The data we receive from source should be JSON, listing will allow to get
        // the exact data collection from the JSON, 
        // ie: Spring REST data which contains the data in 
        // { 
        //      __embedded: {
        //          'roles': [
        //              {}, {}
        //          ]
        //      }
        // }
        // listing: (json:any) => {
        //     var ky = Object.keys(json._embedded)[0];
        //     return json._embedded[ky];
        // },
        listingFunc = nextProps.listing;
        fetch(src, this.state.headers )
          .then(response => {
              return response.json();
          })
          .then(json => {
              let itemsJson: any = listingFunc(json);
              let items: any = itemsJson.map((item: any) => {
                  // we need to convert the data to match with react-select format
                  // so we use optionFunc to convert our data to match
                  // react-select compatible object
                  // ie:
                  // { role: "SOME_ROLE", id: 323 }
                  // to
                  // { label: "SOME_ROLE", value: 323 }
                  let opt = nextProps.optionFunc(item);
                  if (opt.value == parent.props.value) {
                      parent.setState({value: opt});
                  }
                  return opt;
              });
              this.setState({ items: items, original: itemsJson }) 
          });
    }

    render() {
        let field:any;
        const props = {...this.props};
        if(props.visible != undefined) {
            if(props.visible == false) {
                return '';
            }
        }
        let parent: any = this;
        let inputProps = {
            name: props.field,
            required: !!props.required,
            id: props.field,
            key: 'input_key_' + props.field,
            value: this.state.value
        };
        let selectProps = {
            clearable: props.clearable || false,
            onChange: parent.onSelectChange,
            options: props.source ? this.state.items : props.options,
            loadOptions: props.loadOptions
        };
        if(props.fieldType == 'select') {
            field = <Select {...inputProps} {...selectProps} />;
        } else if(props.fieldType == 'async') {
            field = <Async {...inputProps} {...selectProps} />;
        } else if(props.fieldType == 'asyncCreate') {
            field = <AsyncCreatable {...inputProps} {...selectProps} />;
        } else if(this.props.fieldType == 'create') {
            field = <Creatable {...inputProps} {...selectProps} />;
        } else {
            let valid: any = {};
            if (props.valid != undefined) {
                valid.valid = props.valid;
            }
            field = <Input type={props.fieldType}
                           onChange={props.update}
                           {...inputProps}
                           {...valid} />;
        }
        if(props.inline) {
            return <InlineFormDisplay {...props} field={field} />
        } else {
            return <ColumnFormDisplay {...props} field={field} />
        }
    }
}


class InlineFormDisplay extends React.Component<any, any> {

    render() {
        let props = this.props;
        return <Row>
            <Col md={4} xs={12}>
                <Label for={props.field}>{props.caption}</Label>
            </Col>
            <Col md={8} xs={12}>
                {props.field}
                {props.feedback || <FormFeedback>{props.feedback}</FormFeedback>}
                {props.hintText || <FormText>{props.hintText}</FormText>}
            </Col>
        </Row>
    }
}

class ColumnFormDisplay extends React.Component<any, any> {

    render() {
        let props = this.props;
        return <React.Fragment>
            <span className="formLabel">
                <Label for={props.field}>{props.caption}</Label>
            </span>
            {props.field}
            {props.feedback || <FormFeedback>{props.feedback}</FormFeedback>}
            {props.hintText || <FormText>{props.hintText}</FormText>}
        </React.Fragment>
    }
}

class FormFieldGroup extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const details: any = this.props.details;
        if (details.view) {
            return details.view;
        } else {
            return <InputField {...details} />
        }
    }
}

class FormFieldGroups extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    static mergeDefaults(props:any, index:number) {
        const details: any = props.fields[index];
        for(let k in props.defaults) {
            if (!(details.hasOwnProperty(k))) {
                details[k] = props.defaults[k];
            }
        }
        return details;
    }

    render() {
        // sizes and fields
        const props = this.props;
        return props.size.map((size: number, index:number) => {
            const details: any = FormFieldGroups.mergeDefaults(props, index);
            return <Col md={size} sm={12} xs={12} key={'form_field_groups_' + index} >
                <FormFieldGroup details={details} />
            </Col>
        })
    }
}
