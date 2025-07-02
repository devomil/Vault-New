
	DECLARE @SalesChannelId INT
	DECLARE @MarketplaceId INT
	DECLARE @IngramVendorId INT
	DECLARE @LastPriceFileDate DATETIME = '1/7/2021 10:43'


	DECLARE @ProcessDate DATETIME = '1/12/2021 10:20'



	SELECT @MarketplaceId = MarketplaceId,
			@SalesChannelId = SaleschannelId
	FROM Sales.Saleschannel WITH(NOLOCK)
	WHERE Name = 'Amazon TekEnvy'

	SELECT @IngramVendorId = VendorId
	FROM Vendor.Vendor WITH(NOLOCK)
	WHERE Name = 'IngramMicro'


/*
	-- drop table #FedGov
	CREATE TABLE #FedGov
	(
		ProductListingId INT,
		ProductListingSalesChannelID INT,
		ProductParentId INT,
		IngramProductId INT,
		UnitCostGov DECIMAL(8,2),
		ProductId INT,
		MfgPartNo VARCHAR(255),
		VendorId INT,
		RebateAmount DECIMAL(8,2),
		Map DECIMAL(8,2),
		AllowSeePriceInCart BIT,
		ShippingCost DECIMAL(8, 2),
		VendorMarkup DECIMAL(8,2),
		QtyAvailable INT,
		ListQty INT,
		TotalCost DECIMAL(8,2),
		ReferralRate FLOAT,
		GovListPrice DECIMAL(8,2)
	)

*/


/*

	-- Find all listings on current export that have government pricing
	; WITH HasGovPricing AS
	(
		SELECT p.ProductParentId, pp.ProductId, pp.UnitCost
		FROM Sales.ProductPrice pp WITH(NOLOCK)
		INNER JOIN Sales.Product p WITH(NOLOCK)
			ON pp.ProductId = p.ProductId
		WHERE p.VendorId = 1
			AND ISNULL(pp.IndustryCode, '') = 'PAF'
	)
	INSERT INTO #FedGov
	SELECT s.ProductListingId, pl.ProductListingSalesChannelId, s.ProductParentId, g.ProductId 'IngramProductId', g.UnitCost 'UnitCostGov',
		s.ProductId, s.MfgPartNo, s.VendorId, s.RebateAmount, s.Map, s.AllowSeePriceInCart,
		CASE WHEN s.VendorId = @IngramVendorId THEN s.ShippingCost ELSE NULL END 'ShippingCost', 
		CASE WHEN s.VendorId = @IngramVendorId THEN s.VendorMarkup ELSE NULL END 'VendorMarkup', 
		CASE WHEN s.VendorId = @IngramVendorId THEN s.QtyAvailable ELSE NULL END 'QtyAvailable', 
		CASE WHEN s.VendorId = @IngramVendorId THEN s.ListQuantity ELSE NULL END 'ListQty',
		NULL 'TotalUnitCost', NULL 'ReferralRate', NULL 'GovListPrice'
	FROM Marketplace.MarketplaceExportDataSelection s WITH(NOLOCK)
	INNER JOIN HasGovPricing g
		ON s.ProductParentId = g.ProductParentId
	INNER JOIN Product.vProductListings pl
		ON s.ProductListingId = pl.ProductListingId
		AND pl.SaleschannelId = 2
		AND pl.Active = 1
	WHERE s.Export = 1
		AND s.MarketplaceId = @MarketplaceId
		AND s.ProductListingId IS NOT NULL
		--and s.productParentId = 4508929
	ORDER BY s.ProductParentId

*/

/*
	-- if Ingram wasn't selected as part of export BUT an ingram record exists on export, use that record!  Gov pricing beats cheaper cost from other suppliers on the listing records.
	--SELECT f.*, s.QtyAvailable, s.ListQuantity, s.Export, s.FailedExportReason, s.VendorMarkup, s.ListQuantity, s.ShippingCost, s.RebateAmount, s.Map
	UPDATE f
	SET VendorId = @IngramVendorId,
		ProductId = f.IngramProductId,
		ShippingCost = s.ShippingCost,
		VendorMarkup = s.VendorMarkup,
		QtyAvailable = s.QtyAvailable,
		ListQty = s.ListQuantity
	FROM #FedGov f
	INNER JOIN Marketplace.MarketplaceExportDataSelection s WITH(NOLOCK)
		ON f.IngramproductId = s.ProductId
		AND s.MarketplaceId = @MarketplaceId
	WHERE f.VendorId <> @IngramVendorId
		AND s.FailedExportReason NOT IN ('Freight Exception')
	--ORDER BY f.ProductListingSalesChannelId

*/




	---- The remaining DO have Fed Goverment pricing but do NOT have qualified Ingram Product to sell (no qty, for instance)
	-- Can update this to allow pricing updates to gov records when we can upload gov pricing ourselves. 

	/*
		----UPDATE f
		----SET ShippingCost = shipCost.TotalShipCost,
		----	VendorMarkup = (f.UnitCostGov * vpm.ProductMarkup),
		----	QtyAvailable = p.QtyAvailable,
		----	ListQty = CAST((p.QtyAvailable * vendorShip.QtyPercentage/100) AS INT)
		--SELECT f.*,  shipCost.TotalShipCost 'ShippingCost', (f.UnitCostGov * vpm.ProductMarkup) 'VendorMarkup', p.QtyAvailable, CAST((p.QtyAvailable * vendorShip.QtyPercentage/100) AS INT) 'ListQuantity'
		--FROM #FedGov f
		--LEFT OUTER JOIN Sales.vwProducts p
		--	ON f.IngramProductid = p.ProductId
		--	AND p.IndustryCode = 'PAF'
		--LEFT OUTER JOIN Marketplace.VendorProductMarkup vpm WITH(NOLOCK)
		--	ON vpm.VendorId = @IngramVendorId
		--	AND vpm.MarketplaceId = @MarketplaceId
		--CROSS APPLY Vendor.fnShippingParametersByVendorProductPrice(1, p.VendorId, f.UnitCostGov) vendorShip
		--CROSS APPLY Sales.fnShippingCostByVendorProductPrice(1, p.VendorId, NULL, f.UnitCostGov) shipCost
		--WHERE f.VendorId <> @IngramVendorId
	*/


/*
	-- These prods DO have gov pricing from Ingram but do NOT have qualified Ingram Product to sell (no qty, for instance, most likely reason)
	-- Since we cannot update pricing ourselves on a daily basis, let's just remove them from the #FedGov list. They'll get zero'd out later in the process
	--SELECT *
	DELETE
	FROM #FedGov
	WHERE VendorId <> @IngramVendorId
*/

/*
	-- UPDATE Total Cost
	UPDATE f
	SET TotalCost = UnitCostGov + VendorMarkup + ShippingCost - ISNULL(RebateAmount,0)
	--SELECT *, UnitCostGov + VendorMarkup + ShippingCost - ISNULL(RebateAmount,0) 'TotalCost'
	FROM #FedGov f


	select * from #FedGov where TotalCost IS NULL
*/
/*
	-- SET ReferralRate
	UPDATE f
	SET ReferralRate = pfr.ReferralRate
	--select x.*, pfr.*
	FROM #FedGov f
	INNER JOIN Product.vMarketplaceProductListingXrefs x WITH(NOLOCK)
		ON f.ProductListingSalesChannelid = x.ProductListingSalesChannelId
	INNER JOIN Product.MarketplaceProductListingReferralRate pfr WITH(NOLOCK)
		ON x.MarketplaceProductListingXrefId = pfr.MarketplaceProductListingXrefId
		AND pfr.Active = 1


	-- set null referral rates to defaul tof 15%
	UPDATE #FedGov
	SET ReferralRate = .15
	WHERE ReferralRate IS NULL


	-- set referral Gov list price
	-- calc for whne we set our profit margin: 1.00 - .02 - f.ReferralRate 'Test',
	UPDATE f
	SET GovListPrice = CAST(f.TotalCost + (f.TotalCost * f.ReferralRate) - ISNULL(f.RebateAmount, 0)  AS DECIMAL(18,2))
	FROM #FedGov f


	--SELECT *
	UPDATE f
	SET GovListPrice = Map
	FROM #FedGov f
	WHERE GovListPrice < Map
		AND AllowSeePriceInCart = 0
*/
/*

	-- check for dupes. this WILL happen if more than one ingram records exists for a product parent
	-- For now, just keep the lowest list price and then the lowest ingram product id. can come back to add rules about quantity and pricing, etc. later
	; with Dupes as
	(
		SELECT ProductListingSalesChannelId, COUNT(*) 'Count', MIN(GovListPrice) 'MinGovListPrice'
		FROM #FedGov
		GROUP BY ProductListingSalesChannelId
		HAVING COUNT(*) > 1
	)
	--SELECT f.*
	DELETE f
	FROm #FedGov f
	INNER JOIN Dupes d
		ON f.ProductListingSalesChannelId = d.ProductListingSalesChannelId
		AND f.GovListPrice <> d.MinGovListPrice
	--ORDER BY f.ProductListingSalesChannelId


	-- delete the most recent ingram product
	; with Dupes as
	(
		SELECT ProductListingSalesChannelId, COUNT(*) 'Count', MIN(IngramProductId) 'MinIngramProductId'
		FROM #FedGov
		GROUP BY ProductListingSalesChannelId
		HAVING COUNT(*) > 1
	)
	--SELECT f.*
	DELETE f
	FROm #FedGov f
	INNER JOIN Dupes d
		ON f.ProductListingSalesChannelId = d.ProductListingSalesChannelId
		AND f.IngramProductId <> d.MinIngramProductId
	--ORDER BY f.ProductListingSalesChannelId	
*/

--892
/*
	-- drop table #NoFedPricing
	-- Find those Industry records that already exist  but are NOT on the FedGov list
	-- set the quantyt, price and product info to what the non-fed pricing is
	SELECT  pls.ProductListingSalesChannelIndustryId, pl.SourceProductId, pl.UnitCost, pl.ListPrice, pl.Map, pl.Quantity
	INTO #NoFedPricing
	--UPDATE pls
	--SET Quantity = pl.Quantity,
	--	QuantityModifyDate = @ProcessDate,
	--	ListPrice = pl.ListPrice,
	--	Map = pl.Map,
	--	ListPriceModifyDate = @ProcessDate,
	--	SourceProductId = pl.SourceProductId,
	--	ProductModifyDate = @ProcessDate,
	--	ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry pls
	LEFT OUTER JOIN #FedGov f
		ON pls.ProductListingSalesChannelId = f.ProductListingSaleschannelId
	LEFT OUTER JOIN Product.ProductListingSalesChannel pl WITH(NOLOCK)
		ON pls.ProductListingSalesChannelId = pl.ProductListingSaleschannelId
	WHERE f.ProductListingSaleschannelId IS NULL

*/
/*

	-- For no fed pricing, see if we need to do product updates
	--SELECT plsi.*, n.*
	UPDATE plsi
	SET SourceProductId = n.SourceProductId,
		ProductModifyDate = @ProcessDate,
		ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry plsi
	INNER JOIN #NoFedPricing n
		ON plsi.ProductListingSalesChannelIndustryId = n.ProductListingSalesChannelIndustryId
	WHERE plsi.SourceProductId <> n.SourceProductId


	-- For no fed pricing, see if we need to do price updates
	--SELECT plsi.*, n.*
	UPDATE plsi
	SET UnitCost = n.UnitCost,
		ListPrice = n.ListPrice,
		Map = n.Map,
		ListPriceModifyDate = @ProcessDate,
		ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry plsi
	INNER JOIN #NoFedPricing n
		ON plsi.ProductListingSalesChannelIndustryId = n.ProductListingSalesChannelIndustryId
	WHERE plsi.UnitCost <> n.UnitCost
		OR plsi.ListPrice <> n.ListPrice
		OR ISNULL(plsi.Map, 0) <> ISNULL(n.Map, 0)


	-- For no fed pricing, see if we need to do qty updates
	--SELECT plsi.*, n.*
	UPDATE plsi
	SET Quantity = n.Quantity,
		QuantityModifyDate = @ProcessDate,
		ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry plsi
	INNER JOIN #NoFedPricing n
		ON plsi.ProductListingSalesChannelIndustryId = n.ProductListingSalesChannelIndustryId
	WHERE plsi.Quantity <> n.Quantity

*/
/*
	-- Update existing ProductId from Fed Pricing
	--SELECT f.*, plsi.*
	UPDATE plsi
	SET SourceProductId = f.IngramProductId,
		ProductModifyDate = @ProcessDate,
		ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry plsi
	INNER JOIN #FedGov f
		ON plsi.ProductListingSalesChannelId = f.ProductListingSaleschannelId
	WHERE plsi.SourceProductId <> f.IngramProductId




	-- Update existing Qty
	--SELECT f.*, pls.Quantity
	UPDATE pls
	SET Quantity = f.ListQty,
		QuantityModifyDate = @ProcessDate,
		ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry pls
	INNER JOIN #FedGov f
		ON pls.ProductListingSalesChannelId = f.ProductListingSaleschannelId
	WHERE pls.Quantity <> f.ListQty



	-- Update Existing Price
	--SELECT f.*, pls.ListPrice
	UPDATE pls
	SET UnitCost = f.UnitCostGov,
		ListPrice = f.GovListPrice,
		Map = f.Map,
		ListPriceModifyDate = @ProcessDate,
		ModifyDate = @ProcessDate
	FROM Product.ProductListingSalesChannelIndustry pls
	INNER JOIN #FedGov f
		ON pls.ProductListingSalesChannelId = f.ProductListingSaleschannelId
	WHERE pls.ListPrice <> f.GovListPrice
		OR pls.UnitCost <> f.UnitCostGov
		OR ISNULL(pls.Map, 0) <> ISNULL(f.Map, 0)
*/

/*
	-- FInd those records that do not exist and create them but ONLY If the ingram List Qty is not 0
	--INSERT INTO Product.ProductListingSalesChannelIndustry
	SELECT f.ProductListingSalesChannelId, 'GOVFED' 'Industry', f.IngramProductId, f.ListQty 'Quantity', f.UnitCostGov 'UnitCost',
		f.GovListPrice 'ListPrice', f.Map, @ProcessDate 'QuantityModifyDate', @ProcessDate 'ListPriceModifyDate', @ProcessDate 'ProductModifyDate',
		@ProcessDate 'CreateDate', 1 'CreateUser', @ProcessDate 'ModifyDate', 1 'ModifyUser'
		--, f.MfgPartNo
	FROM #FedGov f
	LEFT OUTER JOIN Product.ProductListingSalesChannelIndustry pls WITH(NOLOCK)
		ON f.ProductListingSalesChannelId = pls.ProductListingSalesChannelId
	WHERE pls.ProductListingSalesChannelIndustryId IS NULL
		AND f.ListQty > 0

*/

/*
	-- Find sales channel records that have higher qty than what the gov pricing is. need to update those
	SELECT plsi.*, pls.SourceProductId, pls.SellerSku, pls.quantity
	--UPDATE pls
	--SET Quantity = plsi.Quantity,
	--	QuantityModifyDate = @ProcessDate,
	--	ModifyDate = @ProcessDate,
	--	ModifyUser = 1
	FROM Product.ProductListingSalesChannel pls
	INNER JOIN Product.ProductListingSalesChannelIndustry plsi
		oN pls.ProductListingSalesChannelId = plsi.ProductListingSalesChannelId
	AND plsi.Quantity < pls.Quantity

	--select * from #FedGov where ProductListingSaleschannelId = 862030
*/

/*
	-- find records where the gov list price is currently HIGHER than when we last submited to Az
	-- Need to zero those records out until we can update Az pricing ourselves
	; WITH LastSubmittedRecord AS
	(
		SELECT ProductListingSalesChannelId, MAX(ProductListingSalesChannelIndustryHistoryId) 'MaxId'
		FROM Product.ProductListingSalesChannelIndustryHistory
		WHERE ProductListingSalesChannelIndustryModifyDate <= @LastPriceFileDate
		GROUP BY ProductListingSalesChannelId
	)
	SELECT  h.ProductListingSalesChannelId, h.ProductListingSalesChannelIndustryModifyDate 'HistoryModifyDate', h.UnitCost 'HistoryUnitCost', plsi.UnitCost 'CurrentUnitCost',
			plsi.UnitCost - h.UnitCost 'UnitCostDiff', h.ListPrice 'HistoryListPrice', plsi.ListPrice 'CurrentListPrice', plsi.ListPrice - h.ListPrice 'ListPriceDiff', pls.SellerSku
	FROM Product.ProductListingSalesChannelIndustryHistory h
	INNER JOIN LastSubmittedRecord lh
		ON h.ProductListingSalesChannelIndustryHistoryId = lh.MaxId 
	INNER JOIN Product.ProductListingSalesChannelIndustry plsi
			ON h.ProductListingSalesChannelIndustryId = plsi.ProductListingSalesChannelIndustryId
	INNER JOIN Product.ProductListingSalesChannel pls with(nolock)
		ON plsi.ProductListingSalesChannelId = pls.ProductListingSalesChannelId
	WHERE h.ListPrice < plsi.ListPrice
		AND (plsi.ListPrice - h.ListPrice) > .01

	--WHERE ProductListingSalesChannelIndustryModifyDate = '1/7/2021 10:43'
	--		AND h.UnitCost <> plsi.UnitCost
			--AND (plsi.UnitCost - h.UnitCost) > .50



	-- CREATE HISTORY RECORDS
	--INSERT INTO Product.ProductListingSalesChannelIndustryHistory
	SELECT ProductListingSalesChannelIndustryId, ProductLIstingSalesChannelid, Industry, SourceProductId, Quantity, UnitCost,
		ListPrice, Map, QuantityModifyDate, ListPriceModifyDate, ProductModifyDate, ModifyDate, ModifyUser
	FROM Product.ProductListingSalesChannelIndustry WITH(NOLOCK)
	WHERE ModifyDate = @ProcessDate

*/