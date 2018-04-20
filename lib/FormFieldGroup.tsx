import * as React from 'react';
import {Card, CardBody, CardHeader} from 'reactstrap';
import {Col, Row} from 'reactstrap';
import InputField from './InputField';


class FormFieldGroup extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        var details: any = this.props.details;
        if (details.view) {
            return <Row key={"key_ffg_d" + details.field} >{details.view}</Row>;
        } else {
            return <Row key={"key_ffg_d" + details.field} >
                    <InputField {...details} />
                   </Row>
        }
    }
}
export default FormFieldGroup;

