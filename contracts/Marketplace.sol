// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error Marketplace__NewItemExist();
error Marketplace__NotOwner();
error Marketplace__NotYourOrder();
error Marketplace__ZeroBalance();
error Marketplace__NotTheSeller();
error Marketplace__ItemNotAllowed();
error Marketplace__NotTheBuyer();
error Marketplace__AlreadyAllowed();
error Marketplace__ZeroAddress();

/** @title A contract for buying and selling fungible items
 *  @author Abolaji
 *  @dev
 */

contract Marketplace is ReentrancyGuard {
    //Variables
    address private feeAccount;
    uint256 private feePercent;
    address private i_owner;
    string public item;
    address payable internal user;
    uint256 public orderCount;

    struct _order {
        address seller;
        string item;
        uint256 qtty_to_sell;
        uint256 price;
        uint256 timestamp;
    }

    mapping(address => mapping(string => uint256)) public goods;

    // store the order
    mapping(address => uint256) public balance;
    mapping(uint256 => _order) public orders;
    mapping(uint256 => ORDER_STATE) public orderStatus;
    mapping(uint256 => bool) public orderFilled;
    mapping(uint256 => bool) public orderCreated;
    mapping(uint256 => bool) public orderDelivered;
    mapping(uint256 => address) public Buyers;
    mapping(uint256 => uint256) public filledAmount;
    mapping(uint256 => uint256) public filledQuantity;
    mapping(string => bool) public allowedItems;

    //Events
    event Withdraw(address indexed user, uint256 indexed amount);
    event OrderCreated(
        uint256 indexed id,
        address indexed seller,
        string item,
        uint256 indexed qtty_to_sell,
        uint256 price,
        uint256 timestamp
    );
    event OrderFilled(
        uint256 indexed id,
        address indexed seller,
        address buyer,
        string item,
        uint256 indexed qtty_bought,
        uint256 price,
        uint256 timestamp
    );
    event OrderDelivered(
        uint256 indexed id,
        address indexed seller,
        address buyer,
        string item,
        uint256 indexed qtty_bought,
        uint256 price,
        uint256 timestamp
    );
    event CancelOpenOrder(
        uint256 indexed id,
        address indexed seller,
        string item,
        uint256 indexed qtty_to_sell,
        uint256 price,
        uint256 timestamp
    );
    event CancelFilledOrder(
        uint256 indexed id,
        address indexed seller,
        address buyer,
        string item,
        uint256 indexed qtty_bought,
        uint256 price,
        uint256 timestamp
    );

    enum ORDER_STATE {
        OPEN,
        FILLED,
        CLOSED
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
        i_owner = msg.sender;
    }

    //////////////////////////////////////////////////
    //////////////// Modifiers //////////////////////
    /////////////////////////////////////////////////

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Marketplace__NotOwner();
        _;
    }

    modifier onlySeller(uint256 _id) {
        _order memory order = orders[_id];
        if (msg.sender != order.seller) revert Marketplace__NotTheSeller();
        _;
    }

    modifier onlyBuyer(uint256 _id) {
        address _buyer = Buyers[_id];
        if (msg.sender != _buyer) revert Marketplace__NotTheBuyer();
        _;
    }

    modifier noZeroAddress(address newAddress) {
        if (newAddress == address(0)) revert Marketplace__ZeroAddress();
        _;
    }

    //////////////////////////////////////////////////
    //////////////// Setters Functions //////////////
    /////////////////////////////////////////////////

    function setFeeAccount(
        address _feeAccount
    ) external onlyOwner noZeroAddress(_feeAccount) {
        feeAccount = _feeAccount;
    }

    function setMarketFee(uint256 _feePercent) external onlyOwner {
        feePercent = _feePercent;
    }

    //////////////////////////////////////////////////
    //////////////// Main Functions /////////////////
    /////////////////////////////////////////////////

    function withdrawEther() external nonReentrant {
        uint256 _amount = balance[msg.sender];
        if (_amount <= 0) {
            revert Marketplace__ZeroBalance();
        }
        user = payable(msg.sender);
        balance[msg.sender] = 0;
        user.transfer(_amount);
        emit Withdraw(msg.sender, _amount);
    }

    /// @dev Create an order as a seller
    function createListing(
        string memory _item,
        uint256 _quantity,
        uint256 _price
    ) external {
        if (!allowedItems[_item]) revert Marketplace__ItemNotAllowed();
        orderCount += 1;
        orders[orderCount] = _order(
            msg.sender,
            _item,
            _quantity,
            _price,
            block.timestamp
        );
        orderStatus[orderCount] = ORDER_STATE.OPEN;
        goods[msg.sender][_item] = _quantity;
        emit OrderCreated(
            orderCount,
            msg.sender,
            _item,
            _quantity,
            _price,
            block.timestamp
        );
    }

    /// @dev Fill an order as a buyer
    function fillOrder(uint256 _id, uint256 _quantity) external payable {
        require(_id > 0 && _id <= orderCount);
        require(orderStatus[_id] == ORDER_STATE.OPEN);

        // Fetch the order
        _order memory order = orders[_id];
        require(_quantity <= order.qtty_to_sell, "Reduce the quantity");
        uint256 amount = _quantity * order.price;
        require(msg.value == amount, "You need more eth");

        address _buyer = msg.sender;
        _orderBond(_id, _quantity);

        // Mark order as filled
        orderFilled[_id] = true;
        orderStatus[_id] = ORDER_STATE.FILLED;
        Buyers[_id] = _buyer;
        filledAmount[_id] = amount;
        filledQuantity[_id] = _quantity;

        emit OrderFilled(
            _id,
            order.seller,
            _buyer,
            order.item,
            _quantity,
            order.price,
            block.timestamp
        );
    }

    /// @dev Getting orders that are still available for buying
    /// @notice This function is optional since an indexer can easily provide this
    /// service at a cheaper rate.
    function open_order()
        external
        view
        returns (
            uint256[] memory idOrder,
            string[] memory _item,
            uint256[] memory _qty,
            uint256[] memory _prc
        )
    {
        idOrder = new uint256[](orderCount);
        _item = new string[](orderCount);
        _qty = new uint256[](orderCount);
        _prc = new uint256[](orderCount);
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orderStatus[i] == ORDER_STATE.OPEN) {
                idOrder[i - 1] = i;
                _item[i - 1] = orders[i].item;
                _qty[i - 1] = orders[i].qtty_to_sell;
                _prc[i - 1] = orders[i].price / (10 ** 15);
            }
        }
        return (idOrder, _item, _qty, _prc);
    }

    /// @dev When the buyer confirms the receipt of the items, the money is released to the seller
    function OrderReceived(uint256 _id) external onlyBuyer(_id) {
        address _buyer = Buyers[_id];
        _order memory order = orders[_id];
        require(orderStatus[_id] == ORDER_STATE.FILLED);
        uint256 amount = filledAmount[_id];
        uint256 quantity = filledQuantity[_id];

        _orderCompleted(_id, amount);
        orderStatus[_id] = ORDER_STATE.CLOSED;
        emit OrderDelivered(
            _id,
            order.seller,
            _buyer,
            order.item,
            quantity,
            order.price,
            block.timestamp
        );
        delete (orders[_id]);
    }

    function cancelOpenOrder(uint256 _id) external onlySeller(_id) {
        _order memory order = orders[_id];
        require(orderStatus[_id] == ORDER_STATE.OPEN);

        emit CancelOpenOrder(
            _id,
            order.seller,
            order.item,
            order.qtty_to_sell,
            order.price,
            block.timestamp
        );
        delete (orders[_id]);
    }

    function cancelFilledOrder(uint256 _id) external {
        _order memory order = orders[_id];
        address _buyer = Buyers[_id];
        if (order.seller != msg.sender && _buyer != msg.sender)
            revert Marketplace__NotYourOrder();
        require(orderStatus[_id] == ORDER_STATE.FILLED);
        uint256 _amount = filledAmount[_id];
        uint256 _quantity = filledQuantity[_id];

        balance[_buyer] += _amount;
        goods[msg.sender][order.item] += _quantity;
        emit CancelFilledOrder(
            _id,
            order.seller,
            _buyer,
            order.item,
            _quantity,
            order.price,
            block.timestamp
        );
        delete (orders[_id]);
    }

    function _orderBond(uint256 _id, uint256 _quantity) internal {
        _order memory order = orders[_id];
        // place order
        goods[order.seller][order.item] -= _quantity;
    }

    function _orderCompleted(uint256 _id, uint256 _amount) internal {
        _order memory order = orders[_id];
        _amount = _amount - ((feePercent * _amount) / 100);
        balance[order.seller] += _amount;
        balance[feeAccount] += ((feePercent * _amount) / 100);
    }

    function addAllowedItems(string memory _item) external onlyOwner {
        if (allowedItems[_item]) revert Marketplace__AlreadyAllowed();
        allowedItems[_item] = true;
    }

    function checkItemIsAllowed(
        string memory _item
    ) external view returns (bool) {
        return allowedItems[_item];
    }

    function myBalance() public view returns (uint256) {
        return balance[msg.sender];
    }
}
