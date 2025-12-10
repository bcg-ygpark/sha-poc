import { useState, useEffect } from "react";
import svgPaths from "../imports/svg-o3ey7j7i6q";
import { Button, Input } from "@digital-wallet/ui";
import { useMyWallet } from "../contexts/WalletContext"
import { Wallet } from "ethers";
import { SOL_ADDRESS,USR_NAME,USR1_ADDRESS,USR1_NAME, USR2_ADDRESS,USR2_NAME, PurchaseTransaction, SECUCHAIN_BRIDGE_URL} from "../imports/myWallet";

interface SubscriptionData {
  id?: string|null;
  tradeNumber: string;
  tradeTime: string;
  customerName: string;
  amount: number;
  status: "완료" | "대기";
  txid: string;
  address: string;
}

const initialMockData: SubscriptionData[] = [
  { tradeNumber: "SHA20251123004Z", tradeTime: "2025-11-10 16:25:33", customerName: "김자산", amount: 1000000000, status: "완료", txid:"1", address: ""},
  { tradeNumber: "SHA20251123004I", tradeTime: "2025-11-10 16:18:15", customerName: "이두사", amount: 500000000, status: "대기" , txid:"2", address: ""},
  { tradeNumber: "SHA20251123004D", tradeTime: "2025-11-10 16:05:47", customerName: "박세무", amount: 2000000000, status: "완료", txid:"3", address: "" },
  { tradeNumber: "SHA20251123004D", tradeTime: "2025-11-10 16:05:47", customerName: "박세무", amount: 2000000000, status: "완료", txid:"4", address: "" },
  {  tradeNumber: "SHA20251123004D", tradeTime: "2025-11-10 16:05:47", customerName: "박세무", amount: 2000000000, status: "완료", txid:"5", address: "" },
  { tradeNumber: "SHA20251123003P", tradeTime: "2025-11-10 15:52:22", customerName: "최부자", amount: 1500000000, status: "완료", txid:"6", address: "" },
  { tradeNumber: "SHA20251123003S", tradeTime: "2025-11-10 15:38:09", customerName: "정금융", amount: 300000000, status: "대기", txid:"7", address: "" },
  { tradeNumber: "SHA20251123003L", tradeTime: "2025-11-10 15:20:44", customerName: "강투자", amount: 800000000, status: "완료", txid:"8", address: "" },
  { tradeNumber: "SHA20251123002W", tradeTime: "2025-11-10 14:55:18", customerName: "오청약", amount: 1200000000, status: "완료", txid:"9", address: "" },
  { tradeNumber: "SHA20251123002M", tradeTime: "2025-11-10 14:32:05", customerName: "송자산", amount: 600000000, status: "완료", txid:"10", address: "" },
];

interface UserData {
  address: string;
  name: string;
}

const initialMockUsers: UserData[] = [
  {address: SOL_ADDRESS, name: USR_NAME},
  {address: USR1_ADDRESS, name: USR1_NAME},
  {address: USR2_ADDRESS, name: USR2_NAME},
]

export default function Subscription() {
  const [filter, setFilter] = useState<"전체" | "대기">("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [mockData, setMockData] = useState<SubscriptionData[]>(initialMockData);
  const [mockUsers, setUserData] = useState<UserData[]>(initialMockUsers);
  const { wallet, isInitialized } = useMyWallet();

  const handleOpenExplorer = (txid: string) => {
    window.open(`${SECUCHAIN_BRIDGE_URL}tx/${txid}`, "_blank", "noopener,noreferrer");
  };

  // recentPurchases를 SubscriptionData로 변환하는 함수
  const convertToSubscriptionData = (purchase: PurchaseTransaction, customerName: string): SubscriptionData | null => {
    if (!purchase) return null;

    // timestamp를 YYYY-MM-DD HH:MM:SS 형식으로 변환
    const date = new Date(purchase.timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const tradeTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // amount를 숫자로 변환 (소수점 제거)
    const amountNum = Math.floor(parseFloat(purchase.amount));

    return {
      id: `purchase-${purchase.txid}`,
      tradeNumber: "SHA20251123005X",
      tradeTime: tradeTime,
      customerName: customerName,
      amount: amountNum,
      status: "완료",
      txid: purchase.txid,
      address: purchase.from,
    };
  };

  // 5초마다 fetchRecentPurchases 호출 및 mockData 업데이트
  useEffect(() => {
    if (!isInitialized) return;

    const processRecentPurchases = () => {
      wallet.fetchRecentPurchases();

      if (wallet.recentPurchases.length === 0) return;

      console.log('[Subscription] Recent Purchases:', wallet.recentPurchases);

      // 각 user의 가장 최근 거래만 추적하기 위한 맵
      const userLatestTx = new Map<string, { purchase: PurchaseTransaction; userName: string }>();

      // 모든 recentPurchases를 순회 (최신 순서대로 이미 정렬되어 있음)
      wallet.recentPurchases.forEach((purchase: PurchaseTransaction) => {
        // mockUsers에 있는 사용자인지 확인
        const user = mockUsers.find(u => u.address.toLowerCase() === purchase.from.toLowerCase());

        if (user && !userLatestTx.has(user.address)) {
          // 해당 user의 첫 번째 거래(=가장 최근)만 저장
          userLatestTx.set(user.address, { purchase, userName: user.name });
        }
      });

      console.log('[Subscription] User latest transactions:', userLatestTx);

      // 변환된 데이터를 mockData에 추가
      setMockData(prevData => {
        let newData = [...prevData];

        userLatestTx.forEach(({ purchase, userName }) => {
          const exists = newData.some(item => item.txid === purchase.txid);

          if (!exists) {
            const converted = convertToSubscriptionData(purchase, userName);
            if (converted) {
              console.log('[Subscription] Adding new data:', converted);
              newData = [converted, ...newData];
            }
          }
        });

        // tradeTime으로 내림차순 정렬 (최신순)
        newData.sort((a, b) => {
          return new Date(b.tradeTime).getTime() - new Date(a.tradeTime).getTime();
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



  const filteredData = mockData.filter((item) => {
    const matchesFilter = filter === "전체" || item.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      item.tradeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const waitingCount = mockData.filter((item) => item.status === "대기").length;
  const completedCount = mockData.filter((item) => item.status === "완료").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-[16px]">
        <h1 className="text-[#101828] font-bold">청약 관리</h1>
      </div>

      {/* Product Info Card */}
      <div className="mb-[24px] rounded-[10px] border border-gray-200 bg-white px-[25px] py-[25px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <p className="text-[#4a5565] text-[20px] not-italic font-bold">신한개인용MMF제2호</p>
            <span className="text-[#99a1af]">|</span>
            <p className="text-[#4a5565]">2025.11.23 16:30 기준</p>
          </div>
          <div className="rounded-[10px] border border-[#bedbff] bg-blue-50 px-[17px] py-[10px]">
            <p className="text-[#155dfc]">● 실시간 연동중</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-[24px] grid grid-cols-3 gap-[24px]">
        <div className="rounded-[10px] border border-gray-200 bg-white px-[24px] py-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mb-[16px] border-b border-gray-100 pb-[8px]">
            <p className="text-[#6a7282]">금일 청약 건수</p>
          </div>
          <div className="mb-[12px]">
            <span className="text-[#155dfc] text-[36px] font-bold">42</span>
            <span className="text-[#4a5565]"> 건</span>
          </div>
          <div className="inline-flex items-center gap-[8px] rounded-full bg-red-50 px-[12px] py-[4px]">
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d={svgPaths.p3155f180} stroke="#E7000B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              <path d={svgPaths.pea6a680} stroke="#E7000B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
            <span className="text-[#e7000b]">+7 건 (전일 대비)</span>
          </div>
        </div>

        <div className="rounded-[10px] border border-gray-200 bg-white px-[24px] py-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mb-[16px] border-b border-gray-100 pb-[8px]">
            <p className="text-[#6a7282]">금일 청약 금액</p>
          </div>
          <div className="mb-[12px]">
            <span className="text-[#155dfc] text-[36px] font-bold">42,158,000,000</span>
            <span className="text-[#4a5565]"> 원</span>
          </div>
          <div className="inline-flex items-center gap-[8px] rounded-full bg-red-50 px-[12px] py-[4px]">
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d={svgPaths.p3155f180} stroke="#E7000B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              <path d={svgPaths.pea6a680} stroke="#E7000B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
            <span className="text-[#e7000b]">+7,500,000,000 원 (전일 대비)</span>
          </div>
        </div>

        <div className="rounded-[10px] border border-gray-200 bg-white px-[24px] py-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mb-[16px] border-b border-gray-100 pb-[8px]">
            <p className="text-[#6a7282]">처리 현황</p>
          </div>
          <div className="space-y-[12px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-[8px]">
              <span className="text-[#4a5565]">환전 완료</span>
              <span className="text-[#4a5565]">{completedCount} 건</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-[8px]">
              <span className="text-[#4a5565]">완전 대기</span>
              <span className="text-[#155dfc]">{waitingCount} 건</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#4a5565]">토큰 발행 예정</span>
              <span className="text-[#4a5565]">42 건</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] border border-gray-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
        {/* Search and Filter */}
        <div className="border-b border-gray-200 px-[24px] py-[24px]">
          <div className="flex items-center justify-between">
            <div className="w-[448px]">
              <Input
                placeholder="거래번호 또는 고객명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[46px] rounded-[10px] border border-[#d1d5dc] bg-gray-50 px-[16px] text-[14px] placeholder:text-[rgba(10,10,10,0.5)]"
              />
            </div>
            <div className="flex gap-[8px]">
              <Button
                variant={filter === "전체" ? "primary" : "secondary"}
                size="sm"
                className={`h-[46px] rounded-[10px] px-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] ${
                  filter === "전체" ? "" : "border border-[#d1d5dc] bg-gray-50 text-[#364153]"
                }`}
                onClick={() => setFilter("전체")}
              >
                전체
              </Button>
              <Button
                variant={filter === "대기" ? "primary" : "secondary"}
                size="sm"
                className={`h-[46px] rounded-[10px] px-[24px] ${
                  filter === "대기"
                    ? "shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
                    : "border border-[#d1d5dc] bg-gray-50 text-[#364153]"
                }`}
                onClick={() => setFilter("대기")}
              >
                환전 대기
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-[#d1d5dc] bg-gray-100">
              <tr>
                <th className="px-[24px] py-[16px] text-left text-[#1e2939]">거래번호</th>
                <th className="px-[24px] py-[16px] text-left text-[#1e2939]">거래일시</th>
                <th className="px-[24px] py-[16px] text-left text-[#1e2939]">고객명</th>
                <th className="px-[24px] py-[16px] text-right text-[#1e2939]">청약금액</th>
                <th className="px-[24px] py-[16px] text-center text-[#1e2939]">환전상태</th>
                <th className="px-[24px] py-[16px] text-center text-[#1e2939]">처리</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.txid} className={index !== filteredData.length - 1 ? "border-b border-gray-200" : ""}>
                  <td className="px-[24px] py-[20px] text-[#101828]">{item.tradeNumber}</td>
                  <td className="px-[24px] py-[20px] text-[#364153]">{item.tradeTime}</td>
                  <td className="px-[24px] py-[20px] text-[#101828]">{item.customerName}</td>
                  <td className="px-[24px] py-[20px] text-right text-[#155dfc]">{item.amount.toLocaleString()}</td>
                  <td className="px-[24px] py-[20px]">
                    <div className="flex justify-center">
                      {item.status === "완료" ? (
                        <span className="rounded-full border border-[#8ec5ff] bg-blue-100 px-[12px] py-[4px] text-[#1447e6]">
                          완료
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#ffd230] bg-[#fef3c6] px-[12px] py-[4px] text-[#bb4d00]">
                          대기
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <div className="flex justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-[10px] bg-[#4a5565] px-[16px] py-[6px] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] hover:bg-[#5a6575]"
                        onClick={() => handleOpenExplorer(item.txid)}
                      >
                        상세보기
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 bg-gray-50 px-[24px] py-[17px]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#4a5565]">총 </span>
              <span className="text-[#155dfc]">{filteredData.length}</span>
              <span className="text-[#4a5565]"> 건</span>
            </div>
            <div className="flex gap-[6px]">
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] rounded-[10px] border border-[#d1d5dc] bg-white px-[12px] text-[#364153] opacity-50"
              >
                이전
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="h-[32px] w-[32px] rounded-[10px] bg-[#155dfc] text-white px-0"
              >
                1
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] w-[34px] rounded-[10px] border border-[#d1d5dc] bg-white text-[#364153] px-0"
              >
                2
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] w-[34px] rounded-[10px] border border-[#d1d5dc] bg-white text-[#364153] px-0"
              >
                3
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] w-[34px] rounded-[10px] border border-[#d1d5dc] bg-white text-[#364153] px-0"
              >
                4
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] w-[34px] rounded-[10px] border border-[#d1d5dc] bg-white text-[#364153] px-0"
              >
                5
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] rounded-[10px] border border-[#d1d5dc] bg-white px-[12px] text-[#364153]"
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


