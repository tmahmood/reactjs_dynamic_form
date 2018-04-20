import * as React from 'react';
import {Card, CardBody, CardHeader} from 'reactstrap';
import {Col, Row} from 'reactstrap';
import FormFieldGroup from './FormFieldGroup'


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
            return <Col md={size} sm={12} xs={12} key={'form_field_groups_' + index} >
                <FormFieldGroup details={props.fields[index]} />
            </Col>
        })
    }
}

export default FormFieldGroups;

