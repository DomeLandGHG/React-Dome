interface SwitchButtonProps {
  onSwitch: (selected: 'upgrades' | 'rebirth') => void;
  label1: string;
  label2: string;
}

const SwitchButton =({ onSwitch, label1, label2 }: SwitchButtonProps) => {
    return ( 
        <div className="switch-button-container">
            <button 
                className="switch-button"
                onClick={() => onSwitch('upgrades')}
            >
                {label1}
            </button>
            <button 
                className="switch-button"
                onClick={() => onSwitch('rebirth')}
            >
                {label2}
            </button>
        </div>
    )
}

export default SwitchButton;