# Smart-Lighting-System
연구실에서 진행하는 국가연구 개발 과제에 학부 연구생으로 참여하였으며, 조명 전문 기업(KREMS)과 연계하여 IoT 기반 첨단 스마트라이팅 시스템을 개발하였다. **웹 기반의 지능형 Internet of Everything(IoE) 제어 시스템 개발을 주로 담당하였고 그 부분에 관해서 주로 다뤘다.**

이 프로젝트는 IoE 시스템과 연동하여 지능형 조명 서비스를 제공하고 통신 등의 복합 기능을 가지는 조명기구 및 조명 IoT 시스템이다.

# 개발 기간, 환경, 역할
- 개발 기간: 2017.03 ~ 2018.12
- OS: Liunx ubuntu 16.04
- Language: Node.js, javascript
- Tag: ```Mysql```, ```HTTP```, ```Websocket```, ```Jquery```, ```Rules Engine Nools```, ```JSON```, ```API```, ```View.js```
- 역할

     <img src="https://user-images.githubusercontent.com/58102072/69605094-8f957e80-1062-11ea-8ece-cf8b93aaa017.PNG" width="60%">

# 개발 시스템 전체 구조
   ![structure](https://user-images.githubusercontent.com/58102072/69605168-c4093a80-1062-11ea-847d-89f1897204f9.PNG)

# 개발 내용
- ## 외부 사물 연결 기능 개발
  - **외부 사물 등록 및 관리 기능 구현**
    - 외부 사물 제어 보드는 외부 사물 등록 및 관리를 위해 Main Conroller와 통신 기능 구현
    
         *<외부 사물 - 차량 센서>*
         ![External objects control board](https://user-images.githubusercontent.com/58102072/69616139-6c29fe00-1079-11ea-9b6b-c2fa8905e8fa.PNG)
   
    - 차량 존재 정보를 전송하기 위해 릴레이를 라즈베리파이 GPIO와 연결하고 라즈베리파이에 Main Controller와의 통신 기능 구현
    
      *<차량 센서 터미널 보드의 구성 및 라즈베리파이 기반 통신 모듈 구성>*
      ![Terminal board](https://user-images.githubusercontent.com/58102072/69621032-adbea700-1081-11ea-8409-b202a5260ef5.PNG)
    
    - 차량 센서 제어 및 통신 보드는 Wifi를 통해 인터넷에 접속하고 웹소켓을 통해 Main Controller에 접속됨
    - 차량 센서 제어 및 통신 보드의 전원이 켜지면 메시지 전송을 통해 차량 센서 정보가 스마트 라이팅 시스템 DB에 등록됨
    - 외부 사물이 DB에 등록되면 Web에서 미등록 외부 사물 기기 목록에서 확인 가능하며 사용자가 해당 외부 사물 기기 정보를 입력하면 정식 외부 사물로 동작 가능
    
      *<차량 센서가 외부 사물 기기로 등록된 화면>*
      ![car sensor](https://user-images.githubusercontent.com/58102072/69623728-bebde700-1086-11ea-92f9-be89190d0d47.PNG)
    
    - 차량 센서가 외부 사물로 등록되면 IoE 서비스 생성을 위한 규칙 생성 시 이를 하나의 객체로 사용할 수 있음
    
      *<차량 센서를 IoE 서비스 룰에서 Device 객체로 활용하는 화면>*
      ![car sensor to IoE service rule](https://user-images.githubusercontent.com/58102072/69623968-1ceaca00-1087-11ea-85d3-d15ba2bc515a.PNG)
    
    
  - **외부 서비스(API) 등록 및 관리 기능 구현**
    - 날씨 정보 수집: 날씨 정보는 기상청에서 제공하는 동네예보정보조회 서비스 (http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2) 를 활용함
    - 미세먼지 정보 수집: 미세먼지 정보는 한국환경공단에서 제공하는 대기오염정보 조회 서비스(http://openapi.airkorea.or.kr/) 를 활용함
    
      *<등록된 날씨 정보 및 미세먼지 정보 확인>*
      <img src="https://user-images.githubusercontent.com/58102072/69624691-8ae3c100-1088-11ea-85ab-217211453400.PNG" width="70%">
    
      
    
- ## 서비스 생성 기능 개발
  - **지능형 IoE 시스템을 위한 Web interface 개발**
    - 조명 및 사물, 3rd party 서비스와 관련된 정보를 손쉽게 등록, 조회, 제거하고 UI 컴포넌트를 통하여 조명/사물을 직접 제어하거나 제어 규칙 관리 서비스를 통하여 효율적으로 IoE 시스템을 활용할 수 있는 웹 인터페이스 제공
    - 개발 환경
      - Web UI framework: Bootstrap 기반 HTML5 template + CSS3 + javascript
      - Web application framework: Node.JS/Express + EJS renderer
    
    - 스마트 라이팅 시스템 대쉬보드
      - 스마트 라이팅 시스템을 위한 웹 인터페이스의 메인 뷰로서 시스템에 등록되어 있는 조명, 사용자, 규칙 등의 현황과 시스템 이벤트 로그 등을 확인할 수 있는 UI 컴퓨넌트로 구성
      
           *<스마트 라이팅 시스템 대쉬보드>*
           ![Dashboard](https://user-images.githubusercontent.com/58102072/69627150-71914380-108d-11ea-94d4-3f1a38322ac0.PNG)
      
        
        
    - 스마트 라이팅 시스템 조명 및 사물 관리
      - 스마트 라이팅 시스템에 등록되어 있는 전체적인 방(room), 조명 및 사물들의 현황과 제어를 수행할 수 있는 UI 컴포넌트로 구성
      
           *<공간(방) 정보 확인 페이지>*
           ![Information_confirmation](https://user-images.githubusercontent.com/58102072/69627325-bf0db080-108d-11ea-886b-6b6a1447825b.PNG)
        
        
        
      - 공간 상세 정보 인터페이스
        - 각 방에 대한 기본 정보 조회 가능
        - 각 방에 등록되어 있는 조명장치 및 사물에 대한 정보 조회 가능
        
           *<Rooms 상세 - 조명 >*
        
           ![Room Detail](https://user-images.githubusercontent.com/58102072/69628350-034d8080-108f-11ea-83c5-f45ccfcd7eac.PNG)
       
           *<Rooms 상세 - 사물 선택>*
        
           ![Room Detail2](https://user-images.githubusercontent.com/58102072/69629030-558ea180-108f-11ea-81e3-240afcfdc7c2.PNG)
         
           *<Rooms 상세 - 방 선택>* 
        
           ![Room Detail3](https://user-images.githubusercontent.com/58102072/69629764-c766eb00-108f-11ea-9ede-68afed3603a8.PNG)
          
          
        - 조명 제어 UI를 통한 조명 장치 직접 제어 기능
        
           *<Rooms 상세 - 조명 제어 전 DB 상태>*
           ![Room Detail4](https://user-images.githubusercontent.com/58102072/69630681-828f8400-1090-11ea-89ce-d15ed2aa4cc8.PNG)
        
          
           *<Rooms 상세 - 조명 제어 (빨강 색으로 변경)>*
           ![Room Detail5](https://user-images.githubusercontent.com/58102072/69631035-d4380e80-1090-11ea-859e-e61e74a51755.PNG)
          
           
           *<Rooms 상세 - 조명 제어 후 DB 상태>*
           ![Room Detail6](https://user-images.githubusercontent.com/58102072/69631341-211be500-1091-11ea-928c-8b9fef97cb06.PNG)
          
           
           
  - **Rule engine 기반 IoE 제어 시스템 개발**
     - 룰 엔진을 활용한 조명 제어 규칙 생성 및 규칙 기반 제어 기능 개발
     - 스마트 라이팅 시스템에 수집되는 각종 센서 정보, 3rd party API 서비스에 의한 정보, 조명 및 액츄에이터의 상태 등을 바탕으로 사용자가 조건에 따른 동작 제어 (규칙) 설정을 수행하고, 상황에 따라 사용자의 명시적인 직접 제어 없이 시스템에 등록된 규칙에 기반하여 지능적으로 조명 및 사물에 대한 제어를 제공하는 서비스 개발
     
       *<스마트 라이팅 시스템 룰엔진 구조>*
       ![rules engine structure](https://user-images.githubusercontent.com/58102072/69633173-15312280-1093-11ea-9f8f-9475a239e73e.PNG)
     
     - Javascript로 작성된 RETE 기반의 패턴 매칭 오픈소스 프로젝트 룰 엔진 (Nools)을 활용하여 스마트 라이팅 시스템의 IoE 서버와 통합하고 시스템에 등록/갱신되는 다양한 디바이스, 서비스들의 상황을 사용자가 생성한 규칙(rule)과 매칭함으로써 규칙 기반의 조명 및 사물 제어 서비스 제공
     
       *<Nools 룰엔진 시스템 구조>*
       ![nools system structure](https://user-images.githubusercontent.com/58102072/69633619-eebfb700-1093-11ea-8581-ce64d115dc89.PNG)
     
     - Nools 룰 엔진은 rule의 집합인 flow를 인스턴스화한 session을 중심으로 동작하며, 인스턴스화된 sesison에 fact들을 삽입/갱신/삭제될 수 있고 원하는 시점에 session내에 존재하는 fact들의 상태와 rule들을 매칭하여 규칙에 대한 검사를 수행할 수 있음
     
       *<Nools 룰엔진 룰 표기 방법 (프로그래밍 방식)>*
       ![Nools rules engine](https://user-images.githubusercontent.com/58102072/69634373-693d0680-1095-11ea-8e72-a2edf450d7cb.PNG)
     
       *<Nools 룰엔진 룰 표기 방법 (전용 Markup Language 방식)>*  
       ![Nools rules engine2](https://user-images.githubusercontent.com/58102072/69634503-adc8a200-1095-11ea-9517-a178ef24882e.PNG)
     
        
     - 스마트 라이팅 시스템을 통하여 사용자가 작성한 규칙 중 IF 컴포넌트의 조건문에 해당하는 요소들이 Nools 룰엔진의 fact 형태로 제공되어 규칙 매칭에 활용됨
     
       *<조명 및 사물 제어 룰 저장을 위한 테이블 구조>*
       
       명칭             | type           | 설명
       :--------------- | :------------  | -----------
       rule_id          | int(11)        | Rule 유일 식별 번호 (identifier)
       rule_name        | varchar(50)    | Rule 이름
       rule_description | varchar(100)   | Rule에 대한 설명
       rule_details     | json           | Nools 규칙을 구성하는 json data
       
       
       
     - 주요 기능
          1. 등록되어 있는 룰 조회
            - 각각의 룰은 Rule ID, Rule name, Rule description으로 구성
            
          2. 신규 룰 추가
          
          3. IF-컴포넌트 추가
            - 단일 조건문 구성
              - 공간-디바이스-속성
              - 비교 연산자 (‘>’, ‘<’, ‘==’, ‘!=’ 등)
              - 속성 값
            - 단일 조건문의 복수 추가: 각 조건문이 “AND“ 형태로 연결
            - Preset 기능 추가 (외부 기상 API 서비스 및 시간 관련 조건문)
            
          4. Then-컴포넌트 추가
            - Then-컴포넌트 구성
              - 공간-디바이스-속성
              - 속성 값
            - Preset 기능 추가 (시스템 이벤트 로그 기록 및 일괄 소등)
            
          5. 생성된 규칙에 따라 조명 및 사물 제어 동작
     
     - 주요 기능 별 개발 내용 및 결과
       1. 등록되어 있는 룰 조회
          
          *<조명 및 사물 제어 규칙 (Rules) 현황>*
          ![Rule rule](https://user-images.githubusercontent.com/58102072/69636049-16fde480-1099-11ea-9b93-51d45cf5db35.PNG)
       
          
           
       2. 신규 룰 추가
         - 사물 등록 인터페이스
         - 사물의 이름, 타입, 유일 식별정보(예: MAC) 입력을 통한 등록 과정 진행
           
           *<Rule 추가>*
           
           ![Rule add](https://user-images.githubusercontent.com/58102072/69636317-a60afc80-1099-11ea-96f8-11287bdab52e.PNG)
         
           
           
       3. IF-컴포넌트 추가
       
          *<Rule 추가 - IF 컴포넌트 추가>*
          ![Rule add2](https://user-images.githubusercontent.com/58102072/69636434-eff3e280-1099-11ea-9c3f-49f42d54e6a1.PNG)
       
          
           
       4. Then-컴포넌트 추가
       
          *<Rule 추가 – THEN 컴포넌트 추가>*
          
          ![Rule add3](https://user-images.githubusercontent.com/58102072/69636533-26c9f880-109a-11ea-8b70-4daf05eb879c.PNG)
       
          
          *<Rules 현황 (신규 룰 추가 후)>*
          
          ![Rule add4](https://user-images.githubusercontent.com/58102072/69636607-5416a680-109a-11ea-8f3c-1dd993ce082f.PNG)
         
          
          
       5. 생성된 규칙에 따라 조명 및 사물 제어 동작
         - 특정 시각에 등의 색상을 빨강 색으로 변경하기 위한 룰 수행
         - 전등의 초기 색상: 파랑
         - 룰 수행 후 전등의 색상: 빨강
         
           *<Rules 수행 - 초기 색상 (파랑)>*
           
           ![rule action1](https://user-images.githubusercontent.com/58102072/69637581-3fd3a900-109c-11ea-8cd9-c5bdfdcf39dc.PNG)
           
           
           *<규칙 매칭에 의한 메세지 송/수신 상태>*
           
           ![rule action2](https://user-images.githubusercontent.com/58102072/69637662-75789200-109c-11ea-8839-cdc186a41e7a.PNG)
           
           
           *<Rules 수행 - 변경 된 색상 (빨강)>*
           
           ![rule action3](https://user-images.githubusercontent.com/58102072/69637728-95a85100-109c-11ea-9aff-98de41e8bedb.PNG)
           
