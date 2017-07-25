/**
 * Created by chenyunjie on 2017/7/25.
 */

import React, {Component} from 'react';

import {View} from 'react-native';

import Select from '../src/index';

export default class SelectExample extends Component {

    constructor(props) {
        super(props);

        this.mockData = [
            {'name': '选项1', value: 1},
            {'name': '选项2', value: 2},
            {'name': '选项3', value: 3},
            {'name': '选项4', value: 4},
            {'name': '选项5', value: 5},
            {'name': '选项6', value: 6},
            {'name': '选项7', value: 7}
        ];

        this.onSelectedChanged = this.onSelectedChanged.bind(this);
    }

    render() {

        return (
            <View style={{padding: 30}}>
                <Select dataSource={this.mockData} labelField="name" type="radio" optionStateChange={this.onSelectedChanged}/>
            </View>
        );

    }

    onSelectedChanged(data) {

        console.log('selected : ' + JSON.stringify(data));

    }

}