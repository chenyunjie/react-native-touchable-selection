/**
 * 选项组件
 *
 * Created by apple on 2017/1/6.
 */

import React, {
    Component, PureComponent
} from 'react';

import {
    View, TouchableOpacity, PixelRatio, StyleSheet,Text
} from 'react-native';

import assign from 'object-assign';

//默认两边最小边距
const defaultMinMargin = 10;

//默认option间距
const defaultVGap = 10;

/**
 *
 * <Select
 *          selectedIndex={0}                                   可选                    默认选中索引
 *          selectedOption={option值}                           可选                    默认选择项(优先索引)
 *          renderOption={this.renderOption}                    可选                    自定义渲染函数
 *          type='radio | checkbox'                             可选-默认多选checkbox    多选或单选
 *          dataSource={this.dataSource}[Array]                 必选                    数据源,数组
 *          optionWidth={0}                                     可选-默认0代表自适应      选项宽度
 *          optionHeight={0}                                    可选-默认0代表自适应      选项高度
 *          optionRadius={0}                                    可选-默认0代表没有圆角    圆角值
 *          labelField="text"                                   可选                    文本显示的field,不填写则为字符串数组
 *          optionStateChange={this.onSelected}(option,index, selected)   可选                    选择回调
 *          />
 *
 * 属性:
 *      selectedItems   已经选择的数量
 */
export default class Select extends PureComponent {

    constructor(props) {
        super(props);

        let optionWidth = this.props.optionWidth;
        if (!optionWidth) {
            optionWidth = 0;
        }

        let optionHeight = this.props.optionHeight;
        if (!optionHeight) {
            optionHeight = 0;
        }

        let type = this.props.type;
        if (!type) {
            type = 'checkbox';
        }

        //默认选择项
        let stateObject = this.markSelectedItems(this.props);

        this.state = assign({
            dataSource: this.props.dataSource || [],
            optionWidth: optionWidth,
            optionHeight: optionHeight,
            type: type,
        }, stateObject);



        this._defaultOption = this._defaultOption.bind(this);
        this._defaultRenderOption = this._defaultRenderOption.bind(this);
    }

    //props每次重新获取的时候,需要重新修改state的值,重新渲染页面
    componentWillReceiveProps(nextProps) {

        if (!nextProps.dataSource || nextProps.dataSource.length == 0) {
            return;
        }

        this.setState({
            dataSource: nextProps.dataSource
        });
        if (nextProps.dataSource.length > 0) {
            let stateObject = this.markSelectedItems(nextProps);
            this.setState(stateObject);
        }
    }

    render() {

        let renderOptionFunction = this._defaultOption;

        let optionRenderArray = [];

        this.state.dataSource.map((option, index) => {
            let optionView = renderOptionFunction(option, index);

            if (optionView) {
                optionRenderArray.push(optionView);
            }
        });

        return (
            <View style={[styles.container, this.props.style]}>
                {optionRenderArray}
            </View>
        );

    }

    _defaultOption(option, index) {
        let renderFunction = !this.props.renderOption ? this._defaultRenderOption : this.props.renderOption;

        let marginRight = defaultMinMargin;

        return (
            <TouchableOpacity
                key={index}
                activeOpacity={1}
                onPress={() => this._press(option, index)} style={{marginRight: marginRight, height: this.props.optionHeight + 10}}>
                {renderFunction(option, index)}
            </TouchableOpacity>
        )

    }

    _defaultRenderOption(option, index) {
        let displayValue = option;
        if (typeof(option) != 'string') {
            displayValue = option[this.props.labelField];
        }

        let widthStyle = this.state.optionWidth == 0?{}:{width:this.state.optionWidth}; //如果没有设置宽度或宽度为0，则代表自适应宽度
        let heightStyle = this.state.optionHeight == 0?{}:{height:this.state.optionHeight};//如果没有设置高度或高度为0，则代表自适应高度
        let borderStyle = {borderRadius: this.props.optionRadius || 0};
        return (
            <View style={[
                this.state.stateArray[index] ?
                    styles.optionSelected:
                    styles.optionUnSelected,
                    widthStyle,
                    heightStyle,
                    borderStyle,
            ]}>
                <Text
                    style={
                        this.state.stateArray[index] ?
                            styles.optionTextSelected :
                            styles.optionTextUnSelected
                    }
                >{displayValue}</Text>
            </View>
        );
    }

    markSelectedItems(nextProps) {
        let stateArray = this.props.dataSource.map(() => {return false});
        if (nextProps.selectedIndex || (nextProps.selectedIndex > 0 && nextProps.selectedIndex < nextProps.dataSource.length)) {
            stateArray[nextProps.selectedIndex] = true;
            if (nextProps.optionStateChange) {
                nextProps.optionStateChange(nextProps.dataSource[nextProps.selectedIndex], nextProps.selectedIndex, true);
            }
            return {stateArray: stateArray, lastSelectedIndex: nextProps.selectedIndex};
        } else {
            //默认选择项
            if (nextProps.selectedOption) {
                let index = -1;
                nextProps.dataSource.map((o, i) => {
                    let markSelectedItems = [];
                    if (nextProps.selectedOption instanceof Array) {
                        markSelectedItems = nextProps.selectedOption;
                    } else {
                        markSelectedItems = [nextProps.selectedOption]
                    }

                    markSelectedItems.map((markedOptionItem) => {
                        if (nextProps.labelField) {
                            if(markedOptionItem[nextProps.labelField] == o[nextProps.labelField]) {
                                stateArray[i] = true;
                                index = i;
                            }
                        } else {
                            if (markedOptionItem == o) {
                                stateArray[i] = true;
                                index = i;
                            }
                        }
                    });
                });

                if (nextProps.optionStateChange && index > 0) {
                    nextProps.optionStateChange(nextProps.dataSource[index], index, true);
                }
                return {stateArray: stateArray, lastSelectedIndex: index};
            }

            return {stateArray: stateArray, lastSelectedIndex: -1};
        }
    }

    _press(option, index) {

        if (this.props.selectable == false) {
            if (!this.selectedItems || this.selectedItems.length === 0) {
                if (this.props.selectableOnEmpty === false) {
                    return;
                }
            } else {
                return;
            }
        }

        if (this.props.type == 'radio') {
            let stateArray = this.state.stateArray;
            stateArray[this.state.lastSelectedIndex] = false;
            stateArray[index] = true;
            this.setState({lastSelectedIndex: index});

            if (this.props.optionStateChange) {
                this.props.optionStateChange(option, index, stateArray[index]);
            }
        } else {
            let stateArray = this.state.stateArray;

            stateArray[index] = !stateArray[index];

            this.setState({
                lastSelectedIndex: index,
                stateArray: stateArray
            });

            if (this.props.optionStateChange) {
                this.props.optionStateChange(option, index, stateArray[index]);
            }
        }
    }


    get selectedItems() {
        let items = [];
        this.state.stateArray.map((o,i) => {
            if (o) {
                items.push(this.state.dataSource[i]);
            }
        });
        return items;
    }

    set selectedItems(items) {
        let stateArray = this.props.dataSource.map(() => {return false});
        
	    if (items && items.length) {

            this.props.dataSource.map((o, i) => {
                if (this.props.labelField) {
                    items.map((choosed) => {
                        if(choosed[this.props.labelField] == o[this.props.labelField]) {
                            stateArray[i] = true;
                        }
                    });
                } else {
                    items.map((c) => {
                        if (c == o) {
                            stateArray[i] = true;
                        }
                    });

                }  
            });
        }

        this.setState({
            stateArray : stateArray
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionUnSelected: {
        borderColor: '#dcdcdc',
        borderWidth: 1,
        backgroundColor: 'transparent',
        borderRadius:5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 3,
        paddingBottom: 3,
        marginTop: defaultVGap
    },
    optionSelected: {
        borderColor: '#00b4ff',
        borderWidth: 1,
        backgroundColor: 'transparent',
        borderRadius:5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 3,
        paddingBottom: 3,
        marginTop: defaultVGap
    },
    optionTextSelected: {
        marginHorizontal:15,
        color: '#00b4ff',
        fontSize: 12,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    optionTextUnSelected: {
        marginHorizontal:15,
        color: '#999999',
        fontSize: 12,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    }
});
