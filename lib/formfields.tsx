import * as React from 'react';
import {Card, CardBody, CardHeader, FormFeedback, FormText} from 'reactstrap';
import {Col, Row, FormGroup, Label, Input, Table} from 'reactstrap';
import Select from 'react-select';
import {Creatable as Creatable} from 'react-select';
import {Async as Async} from 'react-select';
import {AsyncCreatable as AsyncCreatable} from 'react-select';


class FormFields extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const props = this.props;
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


class InputField extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        var headers = {};
        if('headers' in props) {
            headers = Object.assign({}, headers, props.headers);
        }
        this.state = {
            options: [],
            value: this.props.value,
            doUpdate: false,
            headers: headers
        };
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    onSelectChange(sopt:any) {
        this.props.update(this.props.field, sopt.value, sopt);
        this.setState({
            value: sopt.value
        });
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
        var listingFunc:any = null;
        if(typeof nextProps.source === 'function') {
            src = nextProps.source();
            if(src == null) {
                return;
            }
        } else {
            src = nextProps.source;
        }
        listingFunc = nextProps.listing;
        fetch(src, this.state.headers )
          .then(response => {
              return response.json();
          })
          .then(json => { 
              var itemsJson:any = listingFunc(json);
              var items:any = itemsJson.map((item: any) => {
                  return nextProps.optionFunc(item);
              });
              this.setState({ items: items, original: itemsJson }) 
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
        return (
        <React.Fragment>
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
       </React.Fragment>)
    }
}

class FormFieldGroup extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        var details: any = this.props.details;
        if (details.view) {
            return <Row key={"key_ffg_d" + details.field} >{details.view}</Row>;
        } else {
            return (
            <Row key={"key_ffg_d" + details.field} >
                    <InputField {...details} />
           </Row>)
        }
    }
}

class FormFieldGroups extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    mergeDefaults(props:any, index:number) {
        var details:any = props.fields[index];
        for(var k in props.defaults) {
            if (!(k in details)) {
                details[k] = props.defaults[k];
            }
        }
        return details;
    }

    render() {
        // sizes and fields
        const props = this.props;
        return props.size.map((size: number, index:number) => { 
            var details:any = this.mergeDefaults(props, index);
            return (
            <Col md={size} sm={12} xs={12} key={'form_field_groups_' + index} >
                <FormFieldGroup details={props.fields[index]} />
            </Col>)
        })
    }
}

export default FormFields;
