import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, LocalizeText, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';
import { useChatInputWidget } from '../../hooks';

const styles = {
    'box-shadow': '0 3px 0 1px rgba(0, 0, 0, 0.3)',
    display: 'inline-block',
    'line-height': '1.2',
    'text-align': 'center',
    'background-color': '#00813e',
    'border-color': '#8eda55',
    color: '#fff',
    'font-size': '13px',
    padding: '6px 8px',
    'border-radius': '5px',
    'border-style': 'solid',
    'margin-top': '4px',
    'text-transform': 'uppercase',
    cursor: 'pointer',
    width: '86px',
    'margin-left': '1px',
}
const styles2 = {
    'box-shadow': '0 3px 0 1px rgba(0, 0, 0, 0.3)',
    display: 'inline-block',
    'line-height': '1.2',
    'text-align': 'center',
    'background-color': '#00813e',
    'border-color': '#8eda55',
    color: '#fff',
    'font-size': '13px',
    padding: '6px 8px',
    'border-radius': '5px',
    'border-style': 'solid',
    'margin-top': '4px',
    'text-transform': 'uppercase',
    cursor: 'pointer',
    width: '86px',
}
const colors = [ '#00813e', '#8eda55', '#ff0000', '#0000ff' ];
export const BawToolView: FC<{}> = props =>
{

    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false)
    const [ altura, setAltura ] = useState('0')
    const [ estado, setEstado ] = useState('0')
    const [ rotacion, setRotacion ] = useState('0')
    const { sendChat = null } = useChatInputWidget();

    function maxFloor()
    {
        sendChat(':maxfloor', 2);
    }

    function autoFloor()
    {
        sendChat(':autoFloor', 2);
    }

    function reloadRoom()
    {
        sendChat(':unload', 2);
    }

    function changeAltura()
    {
        sendChat(':setz '+altura, 2);
    }

    function resetAltura()
    {
        sendChat(':setz clear', 2);
    }

    function cambiarEstado()
    {
        sendChat(':sets '+estado, 2);
    }

    function resetState()
    {
        sendChat(':sets clear', 2);
    }

    function cambiarRotacion()
    {
        sendChat(':setr '+rotacion, 2);
    }

    function resetRotate()
    {
        sendChat(':setr clear', 2);
    }

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'bawtool/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView style={ { width: '250px' } }>
                    <NitroCardHeaderView headerText={ LocalizeText('builder.tools.header') } onCloseClick={ event => setIsVisible(false) }/>
                    <NitroCardContentView style={ { backgroundColor: 'rgba(28, 28, 32, 0.95)' } }>
                        <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } }>
                            <button onClick={ () => maxFloor() } style={ { ...styles, backgroundColor: 'rgb(46 133 43 / 95%)' } }>{ LocalizeText('builder.tools.maxfloor') }</button>
                            <button onClick={ () => autoFloor() } style={ { ...styles2, backgroundColor: 'rgb(0 101 129)', borderColor: 'rgb(85 173 218)' } }>{ LocalizeText('builder.tools.autofloor') }</button>
                        </div>
                        <button className="btn w-100" onClick={ () => reloadRoom() } style={ { ...styles, backgroundColor: 'rgb(66 0 129)', borderColor: 'rgb(85 99 218)' } }>{ LocalizeText('builder.tools.reload') }</button>
                        <div className="row" style={ { marginTop: '10px' } }>
                            <div className="col-md-4">
                                <input type="number" onChange={ e => setAltura(e.target.value) } placeholder="0" className="form-control" />
                            </div>
                            <div className="col-md-8">
                                <button className="btn w-100" onClick={ () => changeAltura() } style={ { ...styles, backgroundColor: 'rgb(46 133 43 / 95%)' } }>{ LocalizeText('builder.tools.change.altura') }</button>
                            </div>
                        </div>
                        <button className="btn btn-sm w-100" onClick={ () => resetAltura() } style={ { ...styles, backgroundColor: 'rgb(175 169 22 / 82%)', borderColor: 'rgb(201 218 85)' } }>{ LocalizeText('builder.tools.reset.altura') }</button>
                        <div className="row" style={ { marginTop: '10px' } }>
                            <div className="col-md-4">
                                <input type="number" onChange={ e => setRotacion(e.target.value) } placeholder="0" className="form-control" />
                            </div>
                            <div className="col-md-8">
                                <button className="btn w-100" onClick={ () => cambiarRotacion() } style={ { ...styles, backgroundColor: 'rgb(46 133 43 / 95%)' } }>{ LocalizeText('builder.tools.change.rotacion') }</button>
                                
                            </div>
                        </div>
                        <button className="btn btn-sm w-100" onClick={ () => resetRotate() } style={ { ...styles, backgroundColor: 'rgb(175 169 22 / 82%)', borderColor: 'rgb(201 218 85)' } }>{ LocalizeText('builder.tools.reset.rotacion') }</button>
                        <div className="row">
                            <div className="col-md-4">
                                <input type="number" onChange={ e => setEstado(e.target.value) } placeholder="0" className="form-control" />
                            </div>
                            <div className="col-md-8">
                                <button className="btn w-100" onClick={ () => cambiarEstado() } style={ { ...styles, backgroundColor: 'rgb(46 133 43 / 95%)' } }>{ LocalizeText('builder.tools.change.estado') }</button>
                            </div>
                        </div>
                        <button className="btn btn-sm w-100" onClick={ () => resetState() } style={ { ...styles, backgroundColor: 'rgb(175 169 22 / 82%)', borderColor: 'rgb(201 218 85)' } }>{ LocalizeText('builder.tools.reset.estado') }</button>
                    </NitroCardContentView>
                </NitroCardView>
            }
        </>
    );
}
