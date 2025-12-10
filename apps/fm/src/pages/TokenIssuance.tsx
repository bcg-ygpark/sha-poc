import svgPaths from "../imports/svg-dk37z7wkss";
import { useState, useEffect } from "react";
import { useMyWallet } from "../contexts/WalletContext"
import { SOL_ADDRESS,USR_NAME,
  USR_TYPE, USR1_TYPE, USR2_TYPE,
  USR1_ADDRESS,USR1_NAME, USR2_ADDRESS,USR2_NAME, PurchaseTransaction, SECUCHAIN_BRIDGE_URL
  ,SMMF_CONTRACT_ADDRESS
} from "../imports/myWallet";


interface IssuanceData {
  id: string;
  customerId: string;
  type: string;
  amount: number;
  tokenAmount: number;
  walletAddress: string;
}

interface UserData {
  address: string;
  name: string;
  type: string;
}

const initMockData: IssuanceData[] = [];

const initialMockUsers: UserData[] = [
  { address: SOL_ADDRESS, name: USR_NAME, type: USR_TYPE },
  { address: USR1_ADDRESS, name: USR1_NAME, type: USR1_TYPE },
  { address: USR2_ADDRESS, name: USR2_NAME, type: USR2_TYPE },
];


export default function TokenIssuance() {
  const { wallet, isInitialized } = useMyWallet();
  const [mockData, setMockData] = useState<IssuanceData[]>(initMockData);
  const [mockUsers] = useState<UserData[]>(initialMockUsers);
  const [amount, setAmount] = useState("0");
  const numericAmount = Number(amount || "0") || 0;
  const formattedAmount = numericAmount.toLocaleString("ko-KR");

  const handleOpenExplorer = (value: string, type: string = "tx") => {
    window.open(`${SECUCHAIN_BRIDGE_URL}${type}/${value}`, "_blank", "noopener,noreferrer");
  };

  // recentPurchases를 IssuanceData로 변환하는 함수
  const convertToIssuanceData = (purchase: PurchaseTransaction, userName: string, userType: string): IssuanceData | null => {
    if (!purchase) return null;

    const amountNum = Math.floor(parseFloat(purchase.amount));

    // 지갑 주소를 앞 6자리...뒤 4자리 형식으로 변환
    const shortAddress = `${purchase.from.substring(0, 6)}...${purchase.from.substring(purchase.from.length - 4)}`;

    return {
      id: purchase.txid,
      customerId: userName,
      type: userType,
      amount: amountNum,
      tokenAmount: amountNum, // amount와 tokenAmount를 동일하게
      walletAddress: shortAddress,
    };
  };

  // 5초마다 fetchRecentPurchases 호출 및 mockData 업데이트
  useEffect(() => {
    if (!isInitialized) return;

    const processRecentPurchases = () => {
      wallet.fetchRecentPurchases();

      if (wallet.recentPurchases.length === 0) return;

      console.log('[TokenIssuance] Recent Purchases:', wallet.recentPurchases);

      // 각 user의 가장 최근 거래만 추적하기 위한 맵
      const userLatestTx = new Map<string, { purchase: PurchaseTransaction; userName: string; userType: string }>();

      // 모든 recentPurchases를 순회
      wallet.recentPurchases.forEach((purchase: PurchaseTransaction) => {
        // mockUsers에 있는 사용자인지 확인
        const user = mockUsers.find(u => u.address.toLowerCase() === purchase.from.toLowerCase());

        if (user && !userLatestTx.has(user.address)) {
          // 해당 user의 첫 번째 거래(=가장 최근)만 저장
          userLatestTx.set(user.address, { purchase, userName: user.name, userType: user.type });
        }
      });

      console.log('[TokenIssuance] User latest transactions:', userLatestTx);

      // 변환된 데이터를 mockData에 추가
      setMockData(prevData => {
        let newData = [...prevData];

        userLatestTx.forEach(({ purchase, userName, userType }) => {
          const exists = newData.some(item => item.id === purchase.txid);

          if (!exists) {
            const converted = convertToIssuanceData(purchase, userName, userType);
            if (converted) {
              console.log('[TokenIssuance] Adding new data:', converted);
              newData = [converted, ...newData];
            }
          }
        });

        return newData;
      });
    };

    // 초기 실행
    processRecentPurchases();

    // 5초마다 실행
    const intervalId = setInterval(() => {
      processRecentPurchases();
    }, 5000);

    // cleanup
    return () => clearInterval(intervalId);
  }, [isInitialized, wallet]);

  useEffect(() => {
    if (isInitialized) {
      // setAmount(wallet.skrw_balance.toString());
    }
  }, [isInitialized, wallet.skrw_balance]);

  // 5초마다 지갑 잔액 체크
  useEffect(() => {
    if (!isInitialized) return;

    const intervalId = setInterval(async () => {
      await wallet.resync();
      console.log('[PurchaseScreen] Wallet balance updated:', wallet.skrw_balance);

      // amount가 잔액보다 큰지 체크
      if (numericAmount > wallet.skrw_balance) {
        console.log('[PurchaseScreen] Warning: Amount exceeds balance');
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isInitialized, wallet, numericAmount]);

  // 발행 예정 건수, 토큰, 금액 계산
  const issuanceCount = mockData.length;
  const totalTokenAmount = mockData.reduce((sum, item) => sum + item.tokenAmount, 0);
  const totalAmount = mockData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-gray-100 box-border flex min-h-[calc(100vh-64px)] flex-col gap-[30px] px-[32px] pb-[130px] pt-[32px]">
      <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full">
        {/* 상단 요약 카드 */}
      <div className="content-stretch flex flex-col gap-[16px] items-start w-full">
        <p className="font-['Pretendard_GOV:Bold',sans-serif] text-[24px] leading-[36px] text-[#101828]">
          토큰 발행 관리
        </p>

        <div className="bg-white h-[233px] w-full rounded-[10px] border border-gray-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <div className="flex h-full flex-col gap-[24px] px-[33px] pb-px pt-[33px]">
            {/* 상품명/기준일 */}
            <div className="flex h-[47px] items-center gap-[8px] border-b border-gray-200">
              <p className="font-['Pretendard_GOV:Bold',sans-serif] text-[20px] leading-[30px] text-[#4a5565]">
                신한개인용MMF제2호
              </p>
              <span className="text-[#99a1af]">|</span>
              <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[14px] leading-[24px] text-[#00a63e]">
                2025.11.17 09:00 발행 예정
              </p>
            </div>

            {/* 현재 기준가 / 전일 수익률 */}

            <div className="flex h-[96px] items-center justify-between">
              
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[14px] leading-[24px] text-[#6a7282]">
                  발행 예정 건수
                </p>
                <div className="flex items-baseline gap-[8px] h-[48px]">
                  <p className="font-['Pretendard_GOV',sans-serif] font-semibold text-[30px] leading-[48px] text-[#00a63e]">
                    {issuanceCount}
                  </p>
                  <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[16px] leading-[28px] text-[#4a5565]">
                    건
                  </p>
                </div>
                <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[12px] leading-[20px] text-[#6a7282]">
                  2025.11.16 청약분
                </p>
              </div>

              <div className="flex flex-col gap-[8px]">
                <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[14px] leading-[24px] text-[#6a7282]">
                  발행 예정 토큰
                </p>
                <div className="flex items-baseline gap-[8px] h-[48px]">
                  <p className="font-['Pretendard_GOV',sans-serif] font-semibold text-[30px] leading-[48px] text-[#00a63e]">
                    {totalTokenAmount.toLocaleString()}
                  </p>
                  <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[16px] leading-[28px] text-[#4a5565]">
                    sMMF
                  </p>
                </div>
                <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[12px] leading-[20px] text-[#6a7282]">

                </p>
              </div>

              <div className="flex flex-col gap-[8px]">
                <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[14px] leading-[24px] text-[#6a7282]">
                  총 매입 금액
                </p>
                <div className="flex items-baseline gap-[8px] h-[48px]">
                  <p className="font-['Pretendard_GOV',sans-serif] font-semibold text-[30px] leading-[48px] text-[#00a63e]">
                    {totalAmount.toLocaleString()}
                  </p>
                  <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[16px] leading-[28px] text-[#4a5565]">
                    원
                  </p>
                </div>
                <p className="font-['Pretendard_GOV:Regular',sans-serif] text-[12px] leading-[20px] text-[#6a7282]">
                  * PoC 환전 수수료 없음
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* TokenIssuanceTable */}
        <div className="bg-white relative rounded-[10px] shrink-0 w-full" data-name="TokenIssuanceTable">
          <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
          <div className="size-full">
            <div className="content-stretch flex flex-col items-start relative w-full">
              {/* Container9 */}
              <div className="relative shrink-0 w-full" data-name="Container">
                <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
                <div className="size-full">
                  <div className="box-border content-stretch flex flex-col items-start pb-px pt-[24px] px-[24px] relative w-full">
                    {/* <div className="h-[27px] relative shrink-0 w-full" data-name="Heading 3">
                      <p className="absolute font-['Pretendard_GOV:Medium',sans-serif] leading-[27px] left-0 not-italic text-[#1e2939] text-nowrap top-[-0.5px] whitespace-pre">발행 대기 목록</p>
                    </div> */}

                    <div className="mb-[8px] h-[37px] ">
                    <p className="font-['Pretendard_GOV',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1e2939]">
                      발행 대기 목록
                    </p>
            </div>
                  </div>
                </div>
              </div>

              {/* Container10 - Header Row */}
              <div className="relative shrink-0 w-full h-[56.5px] bg-gray-100" data-name="Container">
                <div className="absolute h-[56.5px] left-0 top-0 w-[1374px]" data-name="Table Row">
                  <div aria-hidden="true" className="absolute border-b border-gray-200 inset-0 pointer-events-none" />
                  <div className="absolute h-[56.5px] left-0 top-0 w-[273.188px] " data-name="Header Cell">
                    <p className="absolute font-['Pretendard_GOV:Bold',sans-serif] leading-[24px] left-[24px] not-italic text-[#4a5565] text-nowrap top-[15.5px] whitespace-pre">거래번호</p>
                  </div>
                  <div className="absolute h-[56.5px] left-[273.19px] top-0 w-[212.633px]" data-name="Header Cell">
                    <p className="absolute font-['Pretendard_GOV:Bold',sans-serif] leading-[24px] left-[24px] not-italic text-[#4a5565] text-nowrap top-[15.5px] whitespace-pre">고객 ID</p>
                  </div>
                  <div className="absolute h-[56.5px] left-[485.82px] top-0 w-[148.43px]" data-name="Header Cell">
                    <p className="absolute font-['Pretendard_GOV:Bold',sans-serif] leading-[24px] left-[74.38px] not-italic text-[#4a5565] text-center text-nowrap top-[15.5px] translate-x-[-50%] whitespace-pre">유형</p>
                  </div>
                  <div className="absolute h-[56.5px] left-[634.25px] top-0 w-[258.969px]" data-name="Header Cell">
                    <p className="absolute font-['Pretendard_GOV:Bold',sans-serif] leading-[24px] left-[235.05px] not-italic text-[#4a5565] text-nowrap text-right top-[15.5px] translate-x-[-100%] whitespace-pre">매입 금액</p>
                  </div>
                  <div className="absolute h-[56.5px] left-[893.22px] top-0 w-[237.633px]" data-name="Header Cell">
                    <p className="absolute font-['Pretendard_GOV:Bold',sans-serif] leading-[24px] left-[213.71px] not-italic text-[#4a5565] text-nowrap text-right top-[15.5px] translate-x-[-100%] whitespace-pre">발행 토큰</p>
                  </div>
                  <div className="absolute h-[56.5px] left-[1130.85px] top-0 w-[243.148px]" data-name="Header Cell">
                    <p className="absolute font-['Pretendard_GOV:Bold',sans-serif] leading-[24px] left-[24px] not-italic text-[#4a5565] text-nowrap top-[15.5px] whitespace-pre">지갑 주소</p>
                  </div>
                </div>
              </div>

              {/* Data Rows - 동적 생성 */}
              {mockData.map((item, index) => (
                <div key={index} className="relative shrink-0 w-full h-[69px]" data-name="Container">
                  <div className="absolute h-[69px] left-0 top-0 w-[1374px]" data-name="Table Row">
                    <div aria-hidden="true" className="absolute border-b border-gray-200 inset-0 pointer-events-none" />
                    <div className="absolute h-[69px] left-0 top-0 w-[273.188px]" data-name="Data Cell">
                      <p className="absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[24px] left-[24px] not-italic text-[#1e2939] text-nowrap top-[22px] whitespace-pre">{item.id.substring(0, 4)}</p>
                    </div>
                    <div className="absolute h-[69px] left-[273.19px] top-0 w-[212.633px]" data-name="Data Cell">
                      <p className="absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[24px] left-[24px] not-italic text-[rgb(30,41,57)] text-nowrap top-[22px] whitespace-pre">{item.customerId}</p>
                    </div>
                    <div className="absolute h-[69px] left-[485.82px] top-0 w-[148.43px]" data-name="Data Cell">
                      <div className={`${item.type === "개인" ? "bg-blue-50" : "bg-purple-50"} h-[28px] relative rounded-[14px] top-[20px] w-[41px]`} style={{ left: "53.715px" }}>
                        <div aria-hidden="true" className={`absolute border ${item.type === "개인" ? "border-blue-200" : "border-purple-200"} border-solid inset-0 pointer-events-none rounded-[14px]`} />
                        <p className={`absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[20px] left-[21px] not-italic ${item.type === "개인" ? "text-blue-600" : "text-purple-600"} text-center text-nowrap top-[3.5px] translate-x-[-50%] whitespace-pre text-[14px]`}>{item.type}</p>
                      </div>
                    </div>
                    <div className="absolute h-[69px] left-[634.25px] top-0 w-[258.969px]" data-name="Data Cell">
                      <p className="absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[24px] left-[235.05px] not-italic text-[#1e2939] text-nowrap text-right top-[22px] translate-x-[-100%] whitespace-pre">{item.amount.toLocaleString()}원</p>
                    </div>
                    <div className="absolute h-[69px] left-[893.22px] top-0 w-[237.633px]" data-name="Data Cell">
                      <p className="absolute font-['Pretendard_GOV',sans-serif] font-semibold leading-[24px] left-[213.71px] not-italic text-[#00a63e] text-nowrap text-right top-[22px] translate-x-[-100%] whitespace-pre">{item.tokenAmount.toLocaleString()}</p>
                    </div>
                    <div className="absolute h-[69px] left-[1130.85px] top-0 w-[243.148px]" data-name="Data Cell">
                      <p className="absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[24px] left-[24px] not-italic text-[#6a7282] text-nowrap top-[22px] whitespace-pre">{item.walletAddress}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Container14 - Empty State */}
              <div className="bg-gray-50 relative shrink-0 w-full" data-name="Container">
                <div className="size-full">
                  <div className="box-border content-stretch flex items-center py-4 px-[24px] relative w-full">
                    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
                      <p className="absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[20px] left-[687px] not-italic text-[#6a7282] text-center text-nowrap top-[-0.5px] translate-x-[-50%] whitespace-pre text-[14px]">발행 대기중인 다른 건이 없습니다</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NavActionPanel */}
        <div className="bg-white relative rounded-[10px] shrink-0 w-full" data-name="NAVActionPanel">
          <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
          <div className="size-full">
            <div className="box-border content-stretch flex flex-col items-start p-[33px] relative w-full">
              {/* Container18 */}
              <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Container">
                {/* Container15 - Smart Contract Info */}
                <div className="basis-0 bg-gray-50 grow min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Container">
                  <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px]" />
                  <div className="size-full">
                    <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[25px] relative w-full">
                      {/* Container19 */}
                      <div className="content-stretch flex gap-[8px] h-[24px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="relative shrink-0 size-[20px]" data-name="Icon">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                            <g id="Icon">
                              <path d={svgPaths.p4d1b700} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                              <path d={svgPaths.pf865380} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                            </g>
                          </svg>
                        </div>
                        <div className="h-[24px] relative shrink-0 w-[147.5px]" data-name="Heading 3">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[147.5px]">
                            <p className="absolute font-['Pretendard_GOV',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#364153] text-nowrap top-[-0.5px] whitespace-pre">스마트 컨트랙트 정보</p>
                          </div>
                        </div>
                      </div>

                      {/* Paragraph3 */}
                      <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
                        <p className="absolute font-['Pretendard_GOV:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#4a5565] text-nowrap top-[-0.5px] whitespace-pre">
                          컨트랙트: <span
                            className="cursor-pointer hover:text-[#155dfc] transition-colors"
                            onClick={() => handleOpenExplorer(SMMF_CONTRACT_ADDRESS, "address")}
                          >
                            sMMF ({SMMF_CONTRACT_ADDRESS.substring(0, 4)})
                          </span>
                        </p>
                      </div>

                      {/* Container21 */}
                      <div className="content-stretch flex flex-row gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="h-[20px] relative shrink-0 w-auto" data-name="Text">
                          <p className="font-['Pretendard_GOV:Regular',sans-serif] leading-[20px] not-italic text-[#4a5565] text-nowrap whitespace-pre">함수:</p>
                        </div>
                        <div className="bg-[#101828] h-[54px] relative rounded-[10px] grow w-full" data-name="Container">
                          <div aria-hidden="true" className="absolute border border-[#364153] border-solid inset-0 pointer-events-none rounded-[10px]" />
                          <div className="size-full">
                            <div className="box-border content-stretch flex flex-col gap-[4px] h-[54px] items-start justify-center pl-[17px] pr-[17px] w-full">
                              <div className="h-[20px] relative shrink-0 w-full" data-name="Text">
                                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic text-[#05df72] whitespace-pre w-full">mintSMMF(0x..)</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Container17 - Action Button */}
                <div className="basis-0 grow rounded-[10px] border border-[#b9f8cf] bg-[#f0fdf4] p-[26px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
                  <p className="mb-[8px] text-center font-['Pretendard_GOV',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1e2939]">
                    블록체인 발행 준비 완료
                  </p>
                  <p className="mb-[16px] text-center font-['Pretendard_GOV:Regular',sans-serif] text-[14px] leading-[20px] text-[#4a5565]">
                    발행 대기 목록을 블록체인에 기록합니다
                  </p>
                  <div className="flex justify-center">
                    <div className="flex h-[54px] w-[320px] items-center justify-center gap-[8px] rounded-[10px] bg-[#00a63e] text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
                      <span className="text-[15px] font-medium">09:00 토큰 발행 실행 ({issuanceCount}건)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
