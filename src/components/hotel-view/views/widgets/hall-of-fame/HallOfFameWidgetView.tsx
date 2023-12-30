import { CommunityGoalHallOfFameData, CommunityGoalHallOfFameMessageEvent, GetCommunityGoalHallOfFameMessageComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { LocalizeText, SendMessageComposer } from '../../../../../api';
import { Text } from '../../../../../common';
import { useMessageEvent } from '../../../../../hooks';
import { HallOfFameItemView } from '../hall-of-fame-item/HallOfFameItemView';
import { HallOfFameWidgetViewProps } from './HallOfFameWidgetView.types';

const styles = {
    hallOfFame: {
        borderRadius: '5px',
        padding: '20px',
        flexDirection: 'row', // Cambia esto a 'row'
        boxSizing: 'border-box', // Asegura que el padding y el borde no aumenten el tamaño total del elemento
        maxWidth: '1000px', // Limita el ancho máximo para mantener el contenido legible
        margin: '0 auto', // Centra el elemento horizontalmente
    },
};


export const HallOfFameWidgetView: FC<HallOfFameWidgetViewProps> = props =>
{
    const { slot = -1, conf = null } = props;
    const [ data, setData ] = useState<CommunityGoalHallOfFameData>(null);

    useMessageEvent<CommunityGoalHallOfFameMessageEvent>(CommunityGoalHallOfFameMessageEvent, event =>
    {
        const parser = event.getParser();

        setData(parser.data);
    });

    useEffect(() =>
    {
        const campaign: string = conf ? conf['campaign'] : '';  
        SendMessageComposer(new GetCommunityGoalHallOfFameMessageComposer(campaign));
    }, [ conf ]);

    if(!data) return null;

    return (
        <div className="hall-of-fame d-flex" style={ { ...styles.hallOfFame, flexDirection: 'column', boxSizing: 'border-box' } }>
            <Text className="hall-of-fame" variant="white" fontSize={ 4 } center> { LocalizeText('halloffame.title') }</Text> 
            <div style={ { flexDirection: 'row', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' } }>
                { data.hof && (data.hof.length > 0) && data.hof.map((entry, index) =>
                {
                    return <HallOfFameItemView key={ index } data={ entry } level={ (index + 1) } />;
                }
                ) }
            </div>
        </div>
    );
}
