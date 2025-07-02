


---- Create Gov Price records for "qualified" ingram products where it doesn't already exist 
--1789

/*
	; WITH GovPricing AS
	(
		SELECT	'MfgName'=RTRIM(b.MfgName), 'MfgPartNo'=RTRIM(b.MfgPartNo), 'VendorSku'=RTRIM(b.VendorSku), 'VendorId' = 1, 
				b.Msrp, b.UnitCost, 'IndustryCode'=CASE RTRIM(b.IndustryCode) WHEN '' THEN NULL ELSE RTRIM(b.IndustryCode) END,
				b.WarehouseHasStock
		FROM Integration.BulkIngramMicroPrice b		
		WHERE ISNULL(RTRIM(b.IndustryCode), '') ='PAF'
	)
	, HasGovPricing AS
	(
		SELECT pp.ProductId
		FROM Sales.ProductPrice pp WITH(NOLOCK)
		INNER JOIN Sales.Product p WITH(NOLOCK)
			ON pp.ProductId = p.ProductId
		WHERE p.VendorId = 1
			AND ISNULL(pp.IndustryCode, '') = 'PAF'
	)
	SELECT DISTINCT g.*, p.ProductId, p.UnitCost 'RegUnitCost',
		'INSERT INTO Sales.ProductPrice VALUES(' + CAST(p.ProductId AS VARCHAR) + ', ' + CAST(g.Msrp as VARCHAR) + ', ' + CAST(g.UnitCost AS VARCHAR) + ', 0.00, ''PAF'', NULL, NULL, GETDATE(), GETDATE())' 'Script'
	--INTO #Temp
	FROM GovPricing g
	INNER JOIN Sales.vwProducts p
		ON g.VendorId = p.VendorId
		AND g.VendorSku = p.VendorSku
		AND g.MfgPartNo = p.MfgPartNo
		AND ISNULL(p.IndustryCode, '') = ''
	LEFT OUTER JOIN HasGovPricing h
		ON p.ProductId = h.ProductId
	WHERE p.VirtualProduct = 0
		AND p.DropShip = 0
		AND p.Authorized = 1
		AND p.Discontinued = 0
		AND p.SpecialOrder = 0
		AND p.FreightException = 0
		AND h.ProductId IS NULL
	ORDER BY p.ProductId

*/





---- need to remove gov pricing that no longer exists  1:38
--DECLARE @SkuVariable VARCHAR(1) = 'R'

-- ; WITH HasGovPricing AS
--	(
--		SELECT p.MfgPartNo, p.VendorSku, p.VendorId, pin.QtyAvailable, pp.ProductPriceId, pp.CreateDate 'PriceCreateDate', pp.ModifyDate 'PriceModifyDate'
--		FROM Sales.ProductPrice pp WITH(NOLOCK)
--		INNER JOIN Sales.Product p WITH(NOLOCK)
--			ON pp.ProductId = p.ProductId
--		INNER JOIN Sales.ProductInventory pin WITH(NOLOCK)
--			ON pin.ProductId = p.ProductId
--		WHERE p.VendorId = 1
--			AND pp.IndustryCode = 'PAF'
--			AND LEFT(p.VendorSku, 1) = @SkuVariable
--	)
--	SELECT h.*,  b.UnitCost, b.IndustryCode, b.InStock, b.Status, b.Authorized, b.WarehouseHasStock,
--		'DELETE FROM Sales.ProductPrice WHERE ProductPriceId = ' + CAST(h.ProductPriceId as VARCHAR),
--		'UPDATE Sales.ProductPrice SET IndustryCode = ''PAF-RETIRED'', ModifyDate = GETDATE() WHERE ProductPriceId = ' + CAST(h.ProductPriceId as VARCHAR)
--	FROM HasGovPricing h
--	LEFT OUTER JOIN Integration.BulkIngramMicroPrice b	WITH(NOLOCK)
--		ON h.VendorSku = RTRIM(b.VendorSku)
--		AND h.MfgpartNo = RTRIM(b.MfgPartNo)
--		AND RTRIM(b.IndustryCode) = 'PAF'
--		AND LEFT(b.VendorSku, 1) = @SkuVariable
--	WHERE b.MfgPartNo IS NULL





/*
	; WITH GovPricing AS
	(
		SELECT	'MfgName'=RTRIM(b.MfgName), 'MfgPartNo'=RTRIM(b.MfgPartNo), 'VendorSku'=RTRIM(b.VendorSku), 'VendorId' = 1, 
				b.Msrp, b.UnitCost, 'IndustryCode'=CASE RTRIM(b.IndustryCode) WHEN '' THEN NULL ELSE RTRIM(b.IndustryCode) END,
				b.WarehouseHasStock
		FROM Integration.BulkIngramMicroPrice b		
		WHERE ISNULL(RTRIM(b.IndustryCode), '') ='PAF'
	)
	SELECT p.*,
		'DELETE FROM Sales.ProductPrice WHERE ProductPriceId = ' + CAST(pp.ProductPriceid AS VARCHAR)
	FROM Sales.Products p
	LEFT OUTER JOIN GovPricing g
		oN p.VendorId = g.VendorId
		AND p.MfgPartNo = g.MfgPartNo
		AND p.VendorSku = g.VendorSku
	LEFT OUTER JOIN Sales.ProductPrice pp with(NOLOCK)
		ON p.ProductId = pp.ProductId
		AND ISNULL(p.IndustryCode, '') = 'PAF'
	WHERE p.VendorId = 1
		AND ISNULL(p.IndustryCode, '') = 'PAF'
		AND g.MfgPartNo IS NULL



		select top 10 * from Sales.ProductPrice with(nolock) where industrycode = 'PAF' order by createdate


; WITH GovPricing AS
	(
		SELECT	'MfgName'=RTRIM(b.MfgName), 'MfgPartNo'=RTRIM(b.MfgPartNo), 'VendorSku'=RTRIM(b.VendorSku), 'VendorId' = 1, 
				b.Msrp, b.UnitCost, 'IndustryCode'=CASE RTRIM(b.IndustryCode) WHEN '' THEN NULL ELSE RTRIM(b.IndustryCode) END,
				b.WarehouseHasStock
		FROM Integration.BulkIngramMicroPrice b		
		WHERE ISNULL(RTRIM(b.IndustryCode), '') ='PAF'
	)
	, HasGovPricing AS
	(
		SELECT p.*, pin.QtyAvailable, pp.ProductPriceId, pp.CreateDate 'PriceCreateDate', pp.ModifyDate 'PriceModifyDate'
		FROM Sales.ProductPrice pp WITH(NOLOCK)
		INNER JOIN Sales.Product p WITH(NOLOCK)
			ON pp.ProductId = p.ProductId
		INNER JOIN Sales.ProductInventory pin WITH(NOLOCK)
			ON pin.ProductId = p.ProductId
		WHERE p.VendorId = 1
			AND ISNULL(pp.IndustryCode, '') = 'PAF'
			AND pp.CreateDate < '12/15/2020'
	)
	SELECT h.*
	FROM HasGovPricing h
	LEFT OUTER JOIN GovPricing g
		oN h.MfgPartNo = g.MfgPartNo
		AND h.VendorSku = g.VendorSku
	WHERE g.MfgPartNo is null

*/


/*
	--- CHECK for dupes	
	; with dupes as
	(
		select ProductId, IndustryCode, COUNT(*) 'count', MIN(ProductPriceId) 'MinProdPrice'
		FROM Sales.ProductPrice with(nolock)
		group by productId, IndustryCode
		having count(*) > 1
	)
	SELECT d.*, pp.*,
		'DELETE FROM Sales.ProductPrice WHERE ProductPriceId = ' + CAST(pp.ProductPriceId AS VARCHAR)
	FROM Dupes d
	inner join Sales.Productprice pp with(nolock)
		ON d.productid = pp.ProductId
		and d.IndustryCode = pp.IndustryCode
		AND d.MinProdPrice <> pp.ProductPriceId
	order by d.count desc

*/


/*
-- check for prodds with gov pricing but NO regular pricing
	; WITH GovPricing AS
	(
		SELECT	'MfgName'=RTRIM(b.MfgName), 'MfgPartNo'=RTRIM(b.MfgPartNo), 'VendorSku'=RTRIM(b.VendorSku), 'VendorId' = 1, 
				b.Msrp, b.UnitCost, 'IndustryCode'=CASE RTRIM(b.IndustryCode) WHEN '' THEN NULL ELSE RTRIM(b.IndustryCode) END,
				b.WarehouseHasStock
		FROM Integration.BulkIngramMicroPrice b		
		WHERE ISNULL(RTRIM(b.IndustryCode), '') ='PAF'
	), NonGovPricing AS
	(
		SELECT	'MfgName'=RTRIM(b.MfgName), 'MfgPartNo'=RTRIM(b.MfgPartNo), 'VendorSku'=RTRIM(b.VendorSku), 'VendorId' = 1, 
				b.Msrp, b.UnitCost, 'IndustryCode'=CASE RTRIM(b.IndustryCode) WHEN '' THEN NULL ELSE RTRIM(b.IndustryCode) END,
				b.WarehouseHasStock
		FROM Integration.BulkIngramMicroPrice b		
		WHERE ISNULL(RTRIM(b.IndustryCode), '') =''
	)
	SELECT n.*
	FROM GovPricing g
	LEFT OUTER JOIN NonGovPricing n
		ON g.MfgPartNo = n.MfgPartNo
		AND g.VendorSku = n.VendorSku
	WHERE n.VendorSku is null
*/


--SELECT ProductId, count(*)
--FROM #Temp
--GROUP BY ProductId
--having count(*) > 1



/*
-- Validate gov pricing NOT used in export
	; WITH HasGovPricing AS
	(
		SELECT p.ProductParentId, pp.ProductId, pp.UnitCost 'GovUnitCost'
		FROM Sales.ProductPrice pp WITH(NOLOCK)
		INNER JOIN Sales.Product p WITH(NOLOCK)
			ON pp.ProductId = p.ProductId
		WHERE p.VendorId = 1
			AND ISNULL(pp.IndustryCode, '') = 'PAF'
	)
	SELECT pl.ProductParentId, pl.SourceProductId, pl.MfgPartNo, pl.UnitCost, g.*, p.UnitCost 'RegularUnitCost'
	FROM Product.vProductListings pl
	INNER JOIN HasGovPricing g
		oN pl.SourceProductId = g.ProductId
		AND pl.SalesChannelId = 2
	LEFT OUTER JOIN Sales.vwProducts p
		ON pl.SourceProductId = p.ProductId
	WHERE pl.UnitCost = g.GovUnitCost
		AND pl.UnitCost <> p.UnitCost

-- Validate new orders are NOT using gov pricing
	; WITH HasGovPricing AS
	(
		SELECT p.ProductParentId, pp.ProductId, pp.UnitCost 'GovUnitCost'
		FROM Sales.ProductPrice pp WITH(NOLOCK)
		INNER JOIN Sales.Product p WITH(NOLOCK)
			ON pp.ProductId = p.ProductId
		WHERE p.VendorId = 1
			AND ISNULL(pp.IndustryCode, '') = 'PAF'
	)
	SELECT o.OrderId, oli.MfgPartNo, oli.ProductParentId, oli.ProductId, oli.VendorId, oli.Vendor, oli.UnitCost, g.*, p.Unitcost 'RegularUnitCost'
	FROM Sales.vwOrderLineItems oli
	INNER JOIN Sales.[Order] o WITH(NOLOCK)
		ON oli.OrderId = o.Orderid
	INNER JOIN HasGovPricing g
		ON oli.ProductParentId = g.ProductParentId
	LEFT OUTER JOIN Sales.vwProducts p
		ON oli.ProductId = p.ProductId
	WHERE CONVERT(DATE, o.CreateDate) >= '12/16/2020'
		--AND oli.UnitCost = g.GovUnitCost
	ORDER BY o.OrderId desc

*/
--	select * from Integration.BulkIngramMicroPrice
--	where vendorsku = '9X3876'


--select * from Sales.vwProducts
--where vendorsku = '9X3876'


--select * from Sales.productPrice
--where Productid in (7884207, 319741)

--INSERT INTO Sales.ProductPrice
--VALUES(7884207, 287.00, 206.94, 0.00, 'PAF', NULL, NULL, getdate(), getdate())


