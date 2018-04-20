import * as React from 'react';
import {Col, FormGroup, Label, Input, FormText, FormFeedback} from 'reactstrap';
import Select from 'react-select';
import {Creatable as Creatable} from 'react-select';
import {Async as Async} from 'react-select';
import {AsyncCreatable as AsyncCreatable} from 'react-select';


class InputField extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            options: [],
            value: this.props.value,
            doUpdate: false,
        };
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    onSelectChange(sopt:any) {
        this.props.update(this.props.field, sopt.value, sopt);
    }

    componentDidCatch(error:any, info:any) {
        // Display fallback UI
        this.setState({ hasError: true });
        // You can also log the error to an error reporting service
        console.log(error, info);
    }



    componentWillReceiveProps(nextProps: any) {
        if(!nextProps.source) {
            if(nextProps.value != this.props.value) {
                this.setState({
                    doUpdate: true,
                    value: nextProps.value
                });
            }
            return;
        }
        if(typeof this.props.changeCondition === 'function' && !this.props.changeCondition()) {
            return;
        }
        var src:string = '';
        if(typeof nextProps.source === 'function') {
            src = nextProps.source();
            if(src == null) {
                return;
            }
        } else {
            src = nextProps.source;
        }
        fetch(src, { credentials: 'include' })
          .then(response => response.json())
          .then(json => { 
              var ky = Object.keys(json._embedded)[0];
              var items:any = json._embedded[ky].map((item: any) => {
                  return nextProps.optionFunc(item);
              });
              this.setState({ items: items, original: json._embedded[ky] }) 
          });
    }

    render() {
        const props = {...this.props};
        if(props.visible != undefined) {
            if(props.visible == false) {
                return '';
            }
        }
        var parent: any = this;
        var inputProps = {
            name: props.field, 
            required: props.required ? true : false,
            id: props.field,
            key: 'input_key_' + props.field
        };
        var selectProps = {
                    clearable: props.clearable || false,
                    onChange: parent.onSelectChange,
                    value: props.value || undefined,
                    options: props.source ? this.state.items : props.options,
                    loadOptions: props.loadOptions
            };
        if(props.fieldType == 'select') {
            var field:any = <Select {...inputProps} {...selectProps} />;
        } else if(props.fieldType == 'async') {
            var field:any = <Async {...inputProps} {...selectProps} />;
        } else if(props.fieldType == 'asyncCreate') {
            var field:any = <AsyncCreatable {...inputProps} {...selectProps} />
        } else if(this.props.fieldType == 'create') {
            var field:any = <Creatable {...inputProps} {...selectProps} />
        } else {
            var valid:any = {};
            if (props.valid != undefined) {
                valid.valid = props.valid;
            }
            var field:any = <Input type={props.fieldType}
                                   onChange={props.update}
                                   value={props.value || undefined}
                                   {...inputProps}
                                   {...valid} />
        }

        return <React.Fragment>
                <Col md={4} className="formLabel" xs={12}>
                    <Label for={props.field}>{props.caption}</Label>
                </Col>
                <Col md={8} xs={12}>
                        {field}
                        {props.feedback || 
                            <FormFeedback>{props.feedback}</FormFeedback>}
                        {props.hintText || 
                            <FormText>{props.hintText}</FormText>}
               </Col>
               </React.Fragment>
    }
}

export default InputField;


