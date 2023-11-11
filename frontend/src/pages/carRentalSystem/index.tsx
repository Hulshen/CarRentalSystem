// 引入Ant Design组件库中的Button和Image组件
import { Button, Image } from 'antd';
// 引入自定义的Header图片
import { Header } from "../../asset";
// 引入React钩子函数
import { useEffect, useState } from 'react';
// 引入自定义的以太坊智能合约和Web3工具函数
import { carRentalSystemContract, myERC20Contract, web3 } from "../../utils/contracts";
// 引入样式文件
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const CarRentalSystemPage = () => {

    const ImagePath = require('../example.png')

    // 定义状态变量
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [rentPrice] = useState(1)
    const [carOwned, setCarOwned] = useState([])
    const [carAvailable, setCarAvailable] = useState([])
    const [carInfoId, setCarInfoId] = useState('')
    const [carRentId, setCarRentId] = useState('')
    const [rentDuration, setRentDuration] = useState('')
    const [carOwner, setCarOwner] = useState('')
    const [carRenter, setCarRenter] = useState('')
    const [flag, setFlag] = useState(0);

    // 初始化检查用户是否已经连接钱包
    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    useEffect(() => {
        if (carRentalSystemContract) {
            carRentalSystemContract.events.CarAvailable()
                .on('data', (event: any) => {
                    const carAvailable = event.returnValues[0]; // 获取事件返回的结果
                    setCarAvailable(carAvailable);
                    console.log(carAvailable);
                })
                .on('error', (error: any) => {
                    console.error(error);
                });
        }
    }, [carRentalSystemContract]);

    useEffect(() => {
        if (carRentalSystemContract) {
            carRentalSystemContract.events.CarOwned()
                .on('data', (event: any) => {
                    const carList = event.returnValues[0]; // 获取事件返回的结果
                    setCarOwned(carList);
                    console.log(carList);
                })
                .on('error', (error: any) => {
                    console.error(error);
                });
        }
    }, [carRentalSystemContract]);


    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('You have claimed ZJU Token.')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onIssueCarNFT = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (carRentalSystemContract) {
            try {
                await carRentalSystemContract.methods.issueCarNFT().send({
                    from: account,
                    timestamp: new Date().getTime() / 1000
                })
                alert('Succeed to issue a car NFT.')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onGetMyCars = async () => {
        if(account === '') { alert('You have not connected wallet yet.'); return }
        if (carRentalSystemContract) {
            try {
                await carRentalSystemContract.methods.getMyCars().send({
                    from: account,
                })
                setFlag(1)
            } catch (error: any) {
                alert(error.message)
            }
        } else alert('Contract not exists.')
    }

    const onGetAvailableCars = async () => {
        if(account === '') { alert('You have not connected wallet yet.'); return}
        if (carRentalSystemContract) {
            try {
                await carRentalSystemContract.methods.getAvailableCars().send({
                    from: account,
                    timestamp: new Date().getTime() / 1000
                })
                setFlag(2)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onGetCarInfo = async () => {
        if(account === '') { alert('You have not connected wallet yet.'); return}
        if(carInfoId == '') { alert('Please input carId.'); return}
        if (carRentalSystemContract) {
            try {
                const carInfo = await carRentalSystemContract.methods.getCarInfo(carInfoId).call()
                setCarOwner(carInfo.owner)
                setCarRenter(carInfo.renter)
                setFlag(3)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onRentCar = async () => {
        if(account === '') { alert('You have not connected wallet yet.'); return}
        if(carRentId === '') { alert('Please input carId.'); return}
        if(!rentDuration) { alert('Please input rent duration.'); return}
        if (carRentalSystemContract && myERC20Contract) {
            try {
                // 当前用户将一些资金授予给carRentalSystem合约
                await myERC20Contract.methods.approve(carRentalSystemContract.options.address, rentPrice*parseInt(rentDuration)).send({
                    from: account
                })
                // 当前用户调用投注操作
                await carRentalSystemContract.methods.rentCar(carRentId, rentDuration).send({
                    from: account,
                    timestamp: new Date().getTime() / 1000
                })
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    function showCarList(carList:string[], title:string) {
        return (
            <div>
                <h2>{title}</h2>
                <ul>
                    {carList.map((car, index) => (
                        <li key={index}>
                            {car} <img src={ImagePath} alt="Car" style={{ width: '450px', height: '265px' }}/>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex',padding: '0 250px'}}>
            <div className='container' style={{ flex: '1', marginRight: '10px' }}>
                <Image width='100%' height='150px' preview={false} src={Header} style={{ marginBottom: '10px' }}/>
                <div className='main'>
                    <h1 style={{ marginBottom: '20px' }}>汽车借用系统</h1>
                    <Button onClick={onClaimTokenAirdrop}>领取空投积分</Button>
                    <div className='account' style={{ marginBottom: '20px' }}>
                        {account === '' && <Button onClick={onClickConnectWallet} >连接钱包</Button>}
                        <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                        <div>当前用户拥有积分：{account === '' ? 0 : accountBalance}</div>
                    </div>
                    <div>免费发行汽车NFT</div>
                    <div>花费{rentPrice}积分，租用一辆汽车一个小时</div>
                    <div className='operation'>
                        <div className='buttons'>
                            <Button style={{width: '200px'}} onClick={onIssueCarNFT}>发行汽车NFT</Button>
                            <Button style={{width: '200px'}} onClick={onGetMyCars}>查看我的汽车</Button>
                            <Button style={{width: '200px'}} onClick={onGetAvailableCars}>查看可借车辆</Button>
                            <div>
                                汽车ID:
                                <input style={{width: '30px',margin: '5px'}} onChange={(e) => setCarInfoId(e.target.value)}/>
                                <Button style={{width: '150px'}} onClick={onGetCarInfo}>查看车辆信息</Button>
                            </div>
                            <div>
                                汽车ID:
                                <input style={{width: '30px',margin: '5px'}} onChange={(e) => setCarRentId(e.target.value)}/>
                                借用时间:
                                <input style={{width: '30px',margin: '5px'}} onChange={(e) => setRentDuration(e.target.value)}/>
                                小时
                                <Button style={{width: '70px',margin: '5px'}} onClick={onRentCar}>借用</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='result' style={{ flex: '1' }}>
                <div>
                    {flag === 0 && <div>暂无输出</div>}
                    {flag === 1 && showCarList(carOwned, `你拥有的汽车NFT如下`)}
                    {flag === 2 && showCarList(carAvailable, `可借用的汽车NFT如下`)}
                    {flag === 3 &&
                        <div>
                            <div style={{margin: '5px'}}>拥有者是{carOwner}</div>
                            <div style={{margin: '5px'}}>{carRenter === '0x0000000000000000000000000000000000000000' ? '暂无使用者' : '使用者是' + carRenter}</div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default CarRentalSystemPage