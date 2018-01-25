import React, { Component } from 'react';
import wheelFactory from './factory';
import styled from 'styled-components';
import fb from './firebase';

import sound from './s1.wav';

class Wheel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            words: [],
            ready: false,
            spinning: false,
        }

        this.soundTimeout = null;
        this.sound = new Audio(sound);
        this.sound.volume = 0.2;
        
    }

    componentWillMount() {

        fb.dbRef.child('words').on('value', snapshot => {
            this.setState({
                words: snapshot.val() || [],
                ready: true
            }, () => {
                this._updateWheel();
            });
        });

        fb.dbRef.child('speed').on('value', snapshot => {
            const speed = snapshot.val() || 0;
            if(speed) {
                this.setState({ spinning: true });
                this.wheel.spin(speed);
            }
        });
    }

    componentDidMount() {
        this._initWheel();
    }

    _initWheel() {
        this.wheel = wheelFactory(this.refs.wheel);
        this.wheel.init({
            width: 800,
            height: 800,
            onWheelTick: () => this._onTick(),
            onEnd: word => this._onEnd(word)
        });
    }

    _onTick() {
        console.log('tick');
        //this.sound.load();
        //this.sound.play();
    }

    _onEnd(word) {
        fb.setSpeed(0);
        this.setState({ spinning: false });
        alert(word);
    }

    _updateWheel() {
        this.wheel.setWords(this.state.words);
        this.wheel.drawWheel();
    }

    _onWordInputChange(e, i) {
        const newWords = [...this.state.words];
        newWords[i] = e.target.value;
        fb.setWords(newWords);
    }

    _handleAddRow() {
        fb.setWords([...this.state.words, '']);
    }

    _handleRemoveRow(index) {
        fb.setWords(this.state.words.filter((w, i) => i !== index));
    }

    _spin() {
        const num = (Math.random()/2) + 0.5;
        fb.setSpeed(num);
        //this.wheel.spin(num);
    }

    render() {
        const { ready, words, spinning } = this.state;
        return (
            <Container>
                <WheelContainer>
                    <div ref="wheel"></div>
                    {ready && !spinning && <SpinButton onClick={this._spin.bind(this)}>Spin The Wheel !</SpinButton>}
                </WheelContainer>
                
                {!spinning &&
                    <div>
                        {words.map((word, i) => {
                            return (
                                <WordInputContainer key={i}>
                                    <WordInput value={word} onChange={e => this._onWordInputChange(e, i)} />
                                    <DelRow onClick={() => this._handleRemoveRow.bind(this)(i)} />
                                </WordInputContainer>
                            );
                        })}
                    </div>
                }
                {ready && !spinning && <AddRow onClick={this._handleAddRow.bind(this)}>Add row</AddRow>}

            </Container>
        );
    }
}

export default Wheel;

const shadow = 'box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12);';

const Container = styled.div`
    text-align:center;
    max-width:1070px;
    margin: 0 auto;
    padding: 50px;
`
const WheelContainer = styled.div`
    background:#fff;
    padding-bottom:50px;
    ${shadow};
    margin-bottom:30px;
`
const SpinButton = styled.button`
    background: #262F3C;
    border: none;
    outline:none;
    color: #fff;
    padding: 20px 40px;
    font-size: 30px;
    letter-spacing:1px;
    cursor:pointer;
    transition: all .2s ease-in-out;
    margin:40px 0 0;
    font-weight: 300;
    &:hover {
        background: #181F27;
        color:#B4B7BB;
    }
`
const WordInputContainer = styled.div`
    position:relative;
    margin-bottom:15px;
`
const WordInput = styled.input`
    width:100%;
    padding:15px 20px;
    font-size:18px;
    border:none;
    outline:none;
    ${shadow};
`
const AddRow = styled.button`
    background: #262F3C;
    border: none;
    outline:none;
    color: #fff;
    padding: 10px 20px;
    font-size: 16px;
    cursor:pointer;
    transition: all .2s ease-in-out;
    float: right;
    &:hover {
        background: #181F27;
        color:#B4B7BB;
    }
`
const DelRow = styled.span`
    position:absolute;
    top:50%;
    right:12px;
    color:#f00;
    cursor:pointer;
    transform: translateY(-50%);
    width:20px;
    height:20px;
    border:2px solid #E93B46;
    border-radius:20px;
    transition: all .2s ease-in-out;
    &:before {
        content:'';
        width:10px;
        height:2px;
        display:block;
        background:#E93B46;
        position:absolute;
        top:50%;
        left:50%;
        transform: translateX(-50%) translateY(-50%);
    }
    &:hover {
        border:2px solid red;   
        &:after {
            background:red;
        }
    }
`