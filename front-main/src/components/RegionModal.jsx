import { useState } from 'react';

const regionData = {
  서울: {
    강남구: ['논현동', '역삼동', '신사동'],
    강서구: ['화곡동', '등촌동'],
  },
  경기: {
    수원시: ['영통동', '인계동'],
    성남시: ['정자동', '분당동'],
  },
  부산: {
    해운대구: ['우동', '좌동'],
    서구: ['암남동', '동대신동'],
  },
};

const RegionModal = ({ onClose, onSelect }) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);

  const handleComplete = () => {
    const parts = [selectedProvince, selectedCity, selectedTown].filter(Boolean);
    const fullRegion = parts.join(' ');
    if (!fullRegion) return; // 아무것도 선택 안 한 경우만 막음!
    onSelect(fullRegion);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '800px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ textAlign: 'center' }}>지역 선택</h2>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          
          {/* 광역시도 */}
          <div style={{ flex: 1 }}>
            <h4>광역시도</h4>
            {Object.keys(regionData).map((prov) => (
              <div
                key={prov}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedProvince === prov ? '#ccf' : 'transparent'
                }}
                onClick={() => {
                  setSelectedProvince(prov);
                  setSelectedCity(null);
                  setSelectedTown(null);
                }}
              >
                {prov}
              </div>
            ))}
          </div>

          {/* 시군구 */}
          <div style={{ flex: 1 }}>
            <h4>시군구</h4>
            {selectedProvince &&
              Object.keys(regionData[selectedProvince]).map((city) => (
                <div
                  key={city}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedCity === city ? '#ccf' : 'transparent'
                  }}
                  onClick={() => {
                    setSelectedCity(city);
                    setSelectedTown(null);
                  }}
                >
                  {city}
                </div>
              ))}
          </div>

          {/* 읍면동 */}
          <div style={{ flex: 1 }}>
            <h4>읍면동</h4>
            {selectedProvince && selectedCity &&
              regionData[selectedProvince][selectedCity].map((town) => (
                <div
                  key={town}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedTown === town ? '#ccf' : 'transparent'
                  }}
                  onClick={() => setSelectedTown(town)}
                >
                  {town}
                </div>
              ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#00bcd4',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button
            onClick={handleComplete}
            style={{
              backgroundColor: '#00bcd4',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionModal;
