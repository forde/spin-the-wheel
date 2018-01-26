import React, { Component } from 'react';
import wheelFactory from './factory';
import styled from 'styled-components';
import fb from './firebase';

import sound from './s1.wav';
import palet from './palet.svg';

class Wheel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            words: [],
            ready: false,
            spinning: false,
            swaperOn: false,
            colors: [],
        }

        this.soundTimeout = null;
        this.sound = new Audio(sound);
        this.sound.volume = 0.2;

        this.colors = [
            ['#f7d046','#034347','#096241','#46AA75','#9EC85E','#EFB240','#DA582F','#CF1C3A','#8C1B4D'],
            ['#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a','#221742'],
            ['#E4E9DC','#D9E8D0','#C2DEB7','#A0CEA7','#72BCB3','#47A1C1','#2B77AA','#1A518D','#193267'],
        ];
        
    }

    componentWillMount() {

        fb.dbRef.child('words').on('value', snapshot => {
            this.setState({
                words: snapshot.val() || [],
                ready: true
            }, () => {
                console.log('words changed', this.state.words);
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

        fb.dbRef.child('colors').on('value', snapshot => {
            const set = snapshot.val() || this.colors[0];
            if(set !== this.state.colors) {
                this.setState({ colors: set }, () => {
                    this.wheel.destroy();
                    this._initWheel();
                    this._updateWheel();
                }); 
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
            colors: this.state.colors,
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

    _setColors(set) {
        fb.setColors(set);
    }

    render() {
        const { ready, words, spinning, swaperOn } = this.state;
        return (
            <Container>
                <WheelContainer>
                    <div ref="wheel"></div>
                    <ColorSwap src={palet} alt="" onClick={() => this.setState({ swaperOn: !this.state.swaperOn })}/>
                    {swaperOn && 
                        <ColorSwaperOptions>
                            {this.colors.map((set, s) => {
                                return (
                                    <div key={s} onClick={() => this._setColors.bind(this)(set)}>
                                        {set.map((col, c) => <span key={c} style={{background:col}} /> )}
                                    </div>
                                );
                            })}
                        </ColorSwaperOptions>
                    }
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
    position:relative;
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
const ColorSwap = styled.img`
    width:40px;
    height:40px;
    cursor:pointer;
    position:absolute;
    top:20px;
    right:20px;
    transition: all .2s ease-in-out;
    &:hover {
        opacity:.8;
    }
`
const ColorSwaperOptions = styled.div`
    position:absolute;
    top:60px;
    right:60px;
    z-index:10;
    padding:5px 10px;
    background:#fff;
    width:160px;
    ${shadow}
    > div {
        position:relative;
        margin: 5px 0;
        display:flex;
        transition: all .2s ease-in-out;
        cursor:pointer;
        span {
            display: flex;
            flex:1;
            height:20px;
        }
        &:hover {
            opacity:.8;
        }
    }
`